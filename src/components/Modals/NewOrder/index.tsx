import React, { useEffect, useState } from 'react';
import { User } from '../../Types';
import styled from 'styled-components';
import store from '../../../app/state/store';
import io from 'socket.io-client';
import socketLink from '../../../socketContext';
import Pay from './pay'

let socket: SocketIOClient.Socket;
socket = io(socketLink);

const axios = require('axios').default;

interface ResponseOrder {
    type: string,
    list: any,
    text: string
}

interface OrderData {
    dimensions: Object,
    quantity: Number,
    surface: String,
    thickness: Number,
    description: String,
    schematics: Array<string>,
    originalPrice:Number,
    actualPrice:Number
}
interface FormDimensions {
    width: Number,
    height: Number
}

interface ToggleProps {
    closeBtn: () => void,
    locale: string,
    user: User
}

declare module 'react' {
    interface HTMLAttributes<T> {
      name?: String,
      dataLabel?: String,
      dangerouslySetInnerHTML?: any,
    }
  }

const {language} = store.getState()

// 用于生成价格随机数,100-10000
const random=()=>{
    const num=Math.floor(Math.random()*9900)
    return num+100
}


const NewOrderModal = ( { closeBtn, user, locale }: ToggleProps ) => {
    
    const [form, setForm] = useState<OrderData>({dimensions: {width: 0, height:0}, description: '', quantity: 0, surface: '', thickness:1.0, schematics:[],originalPrice:0,actualPrice:0});
    const [schematics, setSchematics] = useState<Array<any>>([]);
    const [dimensions, setDimensions ] = useState<FormDimensions>({width: 0, height: 0})
    const [surfaceError, setSurfaceError] = useState(false);
    const [thicknessError, setThicknessError] = useState(false);
    const [dimensionsError, setDimensionsError] = useState(false);
    const [quantityError, setQuantityError] = useState(false);
    const [schematicsError, setSchematicsError] = useState(false);
    // 控制是否弹出付款框的
    const [showPay,setshowPay]=useState(false)

    // 价格状态，这里的价格是原价
    const [price,setPrice]=useState(0)
    const [discount,setDiscount]=useState(1)

    // 折扣
    // let discount=0.9
    console.log(discount,price)

    useEffect(()=>{
        axios.get('/discount',{params:{id:user.id}}).then((res)=>{
            const {discount:resDiscount,totalNum}=res.data
            console.log('resDiscount',resDiscount)
            setDiscount(resDiscount)
        })
    },[user.id])

    const checkType = (file: string) => {
        let type = [];
        if( file.length !== 0){
            for(let i=0; i < file.length; i++){
                if(file[i] === '.'){
                    for( let j=i+1; j < file.length; j++){
                        type.push(file[j]);
                    }
                }
            }
        }
        return type.join('');
    }

    const changeInput = (e: any) => {
        e.preventDefault();

        if(e.target.name==='quantity') {
            if(e.target.value<0) {
                e.target.value=0
                return
            }
        }

        if (e.target.name === "dimensions") {

            setDimensions({...dimensions, [e.target.getAttribute('datatype')]: parseInt(e.target.value)});

        } else if(e.target.name === "schematics") {
            let PathString = [];

            for(let i = 0 ; i < e.target.files.length; i++){
                PathString.push(e.target.files[i].name);
            }

            setForm({...form, [e.target.name]: PathString});
            setSchematics(e.target.files);

        } else if (e.target.name === 'surface' || 'description' || 'thickness') {
            setForm({...form, [e.target.name]: e.target.value});
        } else {
            setForm({ ...form, [e.target.name]: parseInt(e.target.value) })
        }
    }

    // {dimensions: {width: 0, height:0}, description: '', quantity: 0, surface: '', thickness:1.0
    // 随机生成价格
    useEffect(()=>{
        if(form.quantity===0) setPrice(0)
        else {
            setPrice(random())
        }
    },[form])

    useEffect(() => {
        setForm({...form, dimensions});
        // eslint-disable-next-line
    }, [dimensions])

    
    // 发请求和关闭组件等后续流程
    const sendRequest=(orderStatus)=>{

        const formData = new FormData()
        for(let i=0 ; i < schematics!.length ; i++ ){
            formData.append('file', schematics![i]);
        }
        axios.post(`/upload/${user.id}`, formData).then(
                axios.post('/order', {
                    form: {...form,originalPrice:price,actualPrice:Math.floor(price*discount),status:orderStatus,updatedTime:new Date()},
                    userEmail: user.id
                })
                .then( (results: any) => {
                    const { order } = results.data
        
                    const schematicsArr = order.schematics.map((item:string) => {
                        let type = checkType(item);
        
                        if(type === 'dxf'){
                            return item.replace('dxf', 'svg');
                        }
        
                        return item
                    })
                    let OrderResponse = {
                        type: 'list',
                        list: [{
                            id: order._id,
                            quantity: order.quantity,
                            schematics: schematicsArr,
                            eta: order.estimatedTime,
                            description: order.description,
                            dimensions: order.dimensions,
                            currentProcess: order.currentProcess,
                            action: 'View'
                        }],
                        text: '提交成功',
                    };
        
                    store.dispatch({type: "ADD_ORDER", payload: order});
        
                    socket.emit('message-client', { 
                        senderId: 'Customer-Service-auto', 
                        username: user.username, 
                        message: JSON.stringify(OrderResponse), 
                        to: user.id, 
                        date: new Date(),
                        language: language
                    })
                }).catch((err: any) => {
                    console.log(err,' error submitting the form')
                })
            );
            closeBtn();
    }


    const SubmitForm = () => {
        let presentErr = false;

        if(!form.surface){
            setSurfaceError(true);
            presentErr = true;
        } 
        if(!form.thickness){
            setThicknessError(true);
            presentErr = true;
        }
        if(dimensions.width === 0 && dimensions.height === 0){
            setDimensionsError(true);
            presentErr = true;
        } 
        if(!form.quantity){
            setQuantityError(true);
            presentErr = true;
        } 
        if(!schematics){
            setSchematicsError(true);
            presentErr = true;
        } 

        if (presentErr) return;

        // 开始付款流程
        setshowPay(true)
    }


    return(
        <Wrapper>
            <Container>
                <Close onClick= { closeBtn }>
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </Close>

                <Heading>{'新订单'}</Heading>

                <Row>
                    <Label>{locale === "English" ? 'Surface' : '表面'}</Label>
                    <SurfaceInput  name="surface" onChange={changeInput}>
                        <option value=""></option>
                        <option value="Surface 1">{locale === "English" ? 'Surface 1' : "表面1" }</option>
                        <option value="Surface 2">{locale === "English" ? 'Surface 2' : "表面2" }</option>
                        <option value="Surface 3">{locale === "English" ? 'Surface 3' : "表面3" }</option>
                    </SurfaceInput>
                    {surfaceError && <ErrorMessage>{locale === "English" ? 'Please input a surface type' : '请输入表面类型'}</ErrorMessage>}
                </Row>

                <Row>
                    <Label>{locale === "English" ? 'Thickness': '厚度'} (mm)</Label>
                    <ThicknessInput type="Number" step="0.5" min="1.0" max="20.0" name="thickness"  placeholder="1" onChange={changeInput} />
                    {thicknessError && <ErrorMessage>{locale === "English" ? 'Please input the thickness value' : '请输入厚度值' }</ErrorMessage>}

                </Row>

                <Row>
                    <Label>{locale === "English" ? 'Dimensions: Width x Height' : '尺寸：宽x高'} (mm)</Label>
                    <DimensionRow>
                        <DWidth type="Number" datatype="width" name="dimensions" placeholder={locale === "English" ? "width" : '宽度'} onChange={changeInput}/>
                        <DWidth type="Number" datatype="height" name="dimensions" placeholder={locale === "English" ? "height": '高度'}  onChange={changeInput}/>
                    </DimensionRow>
                    {dimensionsError && <ErrorMessage>{locale === "English" ? 'Please input the dimensions of the product' : '请输入产品尺寸'}</ErrorMessage>}
                </Row>

                <Row>
                    <Label>{locale === "English" ? 'Quantity' : '数量'}</Label>
                    <Input type="Number" name="quantity" onChange={changeInput} defaultValue={0}/>
                    {quantityError && <ErrorMessage>{locale === "English" ? 'Please input the quantity of the product to be produced' : '请输入要生产的产品数量'}</ErrorMessage>}
                </Row>

                <Row>
                    <Label> {locale === "English" ? 'Description' : '描述'}</Label>
                    <Input  type="String" name="description" onChange={changeInput}/>
                </Row>

                <Row>
                    <Label>{locale === "English" ? 'Schematics' : '原理图'}</Label>
                    <SchematicRow>
                        <SchematicInput type='file' name="schematics" onChange={changeInput} multiple/>
                    </SchematicRow>
                    {schematicsError && <ErrorMessage>{locale === "English" ? 'Please input a schematic for production' : '请输入生产示意图'}</ErrorMessage>}
                </Row>

                <Row>
                    {
                         discount===1? 
                         <span style={{color: '#fff'}}>价格:{ price }</span>
                         :
                         <span style={{color: '#fff',display:'flex'}}>
                            原价: <del style={{flex:'1'}}> { price }</del>
                             <span style={{color: 'red',flex:'1'}}>折扣: { discount }</span>
                             <span style={{flex:'1',whiteSpace:'nowrap'}}>折后价: {Math.floor(price*discount)}</span>
                         </span>
                         
                    }                    
                </Row>
                <Submit type="button" className="Sbutton" onClick={SubmitForm}>提交</Submit>
                {/* 付款弹窗 */}
                {showPay && <Pay price={Math.floor(price*discount)} success={()=>{
                    console.log('success')
                    setshowPay(false)
                    sendRequest('已付款')
                    }} fail={()=>{
                    console.log('fail')
                    setshowPay(false)
                    sendRequest('待付款')
                }}/>}
            </Container>
        </Wrapper>
    );
};

export default NewOrderModal;

const Wrapper = styled.div`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top:0;
    left: 0;
    width:100%;
    height: 100%;
    background-color: #0000008f;
`;

const Container = styled.div`
    height: 85%;
    width: 40%;
    background-color: #545490;
    border-radius: 20px 20px;
    position: relative;
    display:flex;
    flex-direction: column;
    padding: 10px 60px;
    margin-right: 300px;

    @media screen and (max-width: 1000px){
        width: 60%;
    }
   
    @media screen and (max-width: 720px){
        width: 90%;
    }
`;

const Close = styled.svg`
    position: absolute;
    right: 0;
    margin: 10px 20px 0 0;
    width:20px;
    height: 20px;

    :hover {
        cursor: pointer;
        transition: .5s;
        color: blue;
    }

    path {
        fill: #80868b
    }
`;

const Heading = styled.h1`
    font-size: 30px;
    text-align: center;
`;

const Row = styled.div`
    display: flex;
    flex-direction: column;
    margin: 5px 0;

`;
const Label = styled.div`
    font-size: 16px;
    margin-bottom: 5px;
    color: black;
`;

const Input = styled.input`
    margin: ${props => props.className === "Sbutton" ? '30px 0' : '3px'};
    background-color: #6e6eb3;
    border-radius: 10px 10px;
    color: white;
    padding-left: 10px;
    border: none;
    outline: none;
`;

const DimensionRow = styled(Row)`
    height: 25px;
    flex-direction: row;
`;

const SchematicRow = styled(Row)`
    flex-direction: row;
`;

const DWidth = styled(Input)`
    width: 50%;
    height: 30px;
    font-size: 12px;

    &::placeholder {
        color: white;
    }
`;

const ErrorMessage = styled.div`
    color: red;
    font-size: 15px;
`;

const Submit = styled.button`
    width: 50%;
    height: 40px;
    border-radius: 20px 20px;
    background-color: #54a4ef;
    margin: auto;
    border:none;
    outline: none;

    &:hover{
        background-color: #1890ff;
        transition: .5s;
    }
`;

const SurfaceInput = styled.select`
    background-color: #6e6eb3;
    border-radius: 10px 10px;
    color: white;
    padding-left: 10px;
    border: none;
    outline: none;
    height: 25px;
`;

const ThicknessInput = styled.input`
    background-color: #6e6eb3;
    border-radius: 10px 10px;
    color: white;
    padding-left: 10px;
    border: none;
    outline: none;

    &::placeholder{
        color: white;
    }
`;

const SchematicInput = styled(Input)`
    height: 30px;
    width: 100%;
`;