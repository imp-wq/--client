import React, { useState } from 'react';
import styled from 'styled-components';
import backgroundImg from '../../Assets/Images/Log-in-background.jpeg';
import UserIcon from '../../Assets/icons/User';
import PasswordIcon from '../../Assets/icons/Password';
import EmailIcon from '../../Assets/icons/Email';
import { withRouter } from 'react-router-dom';
import socketLink from '../../socketContext';
import io from 'socket.io-client';
import store from '../../app/state/store';
import ValidateEmail from '../../utils/ValidateEmailFormat';
const {language} = store.getState();

const axios = require('axios').default


const LogInPage = (props: any) => {
    document.title = 'Login Page'
    //Login
    const [password, setPassword] = useState('');
    const [emailAddr, setEmailAddr] = useState('');
    const [passEmptyErr, setPassEmptyErr] = useState(false);
    const [emailEmptyErr, setEmailEmptyErr] = useState(false);
    const [incorrectCombo, setIncorrectCombo ] = useState(false);

    //Signup
    const [username, setUserName] = useState('');
    const [nameEmpty, setNameEmpty] = useState(false);
    const [nameInvalid, setNameInvalid] = useState(false);
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpEmailEmpty, setSignUpEmailEmpty] = useState(false) 
    const [signUpPass, setSignUpPass] = useState('');
    const [ minimumCharactersError, setMinimumCharactersError] = useState(false);
    const [ passEmpty, setPassEmpty ] = useState(false)
    const [signUpPass2, setSignUpPass2] = useState('');
    const [passNoMatch, setPassNoMatch] = useState(false);
    const [userExistsErr, setUserExistsErr] = useState(false);

    //both
    const [blockPos, setBlockPos] = useState('right');
    const [emailFormatErr, setEmailFormatErr ] = useState(false);
    const [signUpEmailFormatErr, setSignUpEmailFormatErr] = useState(false);
    const socket = io(socketLink);

    const LogInAttempt = () => {
        setIncorrectCombo(false);
        setEmailFormatErr(false);
        let errorPresent = false;

        if (!emailAddr || emailAddr.trim() === ''){
            setEmailEmptyErr(true);
            errorPresent = true
        } else if(!ValidateEmail(emailAddr)) {
             setEmailFormatErr(true);
            errorPresent = true;
        }

        if (!password || password.trim() === ''){
            setPassEmptyErr(true);
            errorPresent = true;
        }

        if(errorPresent) return

        axios.post('/login', {
            email: emailAddr,
            password: password,
        })
        .then((results: any) => {

            if(results.status === 200) {

                const { email, name } = results.data;

                store.dispatch({ type: "SIGN_IN", payload:{
                    email,
                    name
                }});

                socket.emit('join', {id: email , username: name });
                // localStorage.setItem('isUserOnline', 'true');

                socket.on('joined', (data: FormData) => {
                    localStorage.setItem('userData', JSON.stringify(data));
                    props.history.push('/chat');
                })  

                socket.emit('message-client', { 
                    senderId: 'Customer-Service-auto', 
                    username: username, 
                    message: language === "English" ? `Hello ${name}! My name is Jarvis, your customer service. How may I help you today?` : `您好${name}！我是 Jarvis。我怎么能帮助您？`, 
                    to: emailAddr, 
                    date: new Date(),
                    language: language
                });
            }
        })
        .catch((err:any) => {
            (err.response.status === 403 || 404) && setIncorrectCombo(true);
        })
    }

    const signUpAttempt = () => {
        let errorPresent = false;

        //name errors
        if(!username || username.trim() === ''){
            setNameEmpty(true)
            errorPresent = true;
        }else if(!username.match(/^[A-Za-z]+$/)) {
            setNameInvalid(true);
            errorPresent = true;
        } 

        //email error
        if(!signUpEmail || signUpEmail.trim() === ''){
            setSignUpEmailEmpty(true)
            errorPresent = true;
        } else if(!ValidateEmail(signUpEmail)){
            setSignUpEmailFormatErr(true);
            errorPresent = true;
        }


        //password error 
        if(!signUpPass || signUpPass.trim() === ''){
            setPassEmpty(true);
            errorPresent=true;
        } else if(signUpPass && signUpPass.length < 8){
            setMinimumCharactersError(true);
            errorPresent=true;
        } else if(signUpPass !== signUpPass2){
            setPassNoMatch(true);
            errorPresent=true;
        }

        if(errorPresent) return;

        axios.post('/new-user', {
            name:username,
            email: signUpEmail,
            password: signUpPass
        })
        .then((results: any) => {
            store.dispatch({ type: "SIGN_IN", payload: {
                email: signUpEmail,
                name: username
            }})
            // localStorage.setItem('isUserOnline', 'true');

            socket.emit('join', {id: signUpEmail , username})

            socket.on('joined', (data: FormData) => {
                localStorage.setItem('userData', JSON.stringify(data));
                props.history.push('/chat');
            })

            socket.emit('message-client', { 
                senderId: 'Customer-Service-auto', 
                username: username, 
                message: language === "English" ? `Hello ${username}! My name is Jarvis, your customer service. How may I help you today?`: `您好 ${username}， 我是Jarvis, 我怎么能帮助您`, 
                to: signUpEmail, 
                date: new Date(),
                language:language
            });
        })
        .catch( (err: any) => {
            if(err.response.status === 409){
                setUserExistsErr(true);
            } else {
                alert('Something went wrong, please try again. If the problem persists, please contact the system administrator')
            }
        });
    }
    return(
        <Wrapper>
            <Container>
                <FormContainer>
                    <SignInForm>
                        <Heading>Log in to your account</Heading>

                        <GuestText>Please log in to your account to get validation of your account</GuestText>

                        {incorrectCombo ? <ErrorLabel> Incorrect email/password combination. </ErrorLabel> : ''}
                        {emailFormatErr ? <ErrorLabel> Please input a valid email address </ErrorLabel> : ''}

                        <InputWrapper>
                            <EmailIcon width='20' height='40'/>
                            <TextInput 
                                placeholder="Email Address" 
                                onChange={e => {
                                    setEmailEmptyErr(false);
                                    setEmailFormatErr(false);
                                    setEmailAddr(e.target.value);
                                }
                                } 
                                value={emailAddr}
                            />
                        </InputWrapper>
                        {emailEmptyErr && <InputError>Please enter your Email Address.</InputError>}


                        {/* <Label>Password:</Label> */}
                        <InputWrapper>
                            <PasswordIcon width='20' height='40'/>
                            <TextInput 
                                placeholder="password"  
                                type="password" 
                                autoComplete="off" 
                                onChange={e => {
                                    setPassEmptyErr(false);
                                    setPassword(e.target.value)
                                }
                                } 
                                value={password}
                            />
                        </InputWrapper>
                        {passEmptyErr && <InputError>Please enter your password.</InputError>}

                        
                        {/* <ForgotPassword href="https://www.google.com"> Forgot Your Password? </ForgotPassword> */}
                        <LogIn onClick={LogInAttempt}>Log In</LogIn>
                    </SignInForm>



                    <SignUpForm>
                        <Heading>Sign up</Heading>

                        <GuestText> Hello, please sign in to manage your personal orders</GuestText>

                        <InputWrapper>
                            <UserIcon width='20' height='40' signUp={true}/>
                            <SignUpTextInput 
                                placeholder="Name" 
                                onChange={e => {
                                    setUserName(e.target.value)
                                    setNameInvalid(false)
                                    setNameEmpty(false)
                                }} 
                                value={username}
                            ></SignUpTextInput>
                        </InputWrapper>
                        {nameEmpty ? <ErrorLabel> Please enter a name. </ErrorLabel> : '' }
                        {nameInvalid ? <ErrorLabel> Please enter a valid name. </ErrorLabel> : ''}
                        <InputWrapper>
                            <EmailIcon width='20' height='40' signUp={true} />
                            <SignUpTextInput 
                                placeholder="Email" 
                                onChange={e => {
                                    setSignUpEmail(e.target.value);
                                    setSignUpEmailEmpty(false);
                                    setSignUpEmailFormatErr(false);
                                    setUserExistsErr(false);
                                }} 
                                value={signUpEmail}
                            ></SignUpTextInput>
                        </InputWrapper>
                        {emailFormatErr ? <ErrorLabel> Please input a valid email address. </ErrorLabel> : ''}
                        {signUpEmailEmpty ? <ErrorLabel> please enter an email address. </ErrorLabel> : ''}
                        {signUpEmailFormatErr ? <ErrorLabel> Please enter a valid format of the email. </ErrorLabel> : ''}
                        {userExistsErr ? <ErrorLabel> A account with this email has already been created. </ErrorLabel> : ''}
                        <InputWrapper>
                            <PasswordIcon width='20' height='40' signUp={true}/>
                            <SignUpTextInput 
                                placeholder="Password" 
                                type="password" 
                                onChange={e => {
                                    setSignUpPass(e.target.value);
                                    setMinimumCharactersError(false);
                                    setPassEmpty(false);
                                }} 
                                value={signUpPass}
                            ></SignUpTextInput>
                        </InputWrapper>
                        {minimumCharactersError ? <ErrorLabel> Password must be atleast 8 characters. </ErrorLabel> : ''}
                        {passEmpty ? <ErrorLabel> Please fill in the password field </ErrorLabel> : ''}
                        <InputWrapper>
                            <PasswordIcon width='20' height='40' signUp={true}/>
                            <SignUpTextInput 
                                placeholder="Password" 
                                type="password" 
                                onChange={e => {
                                    setSignUpPass2(e.target.value);
                                    setPassNoMatch(false);
                                }} 
                                value={signUpPass2}
                            ></SignUpTextInput>
                        </InputWrapper>
                        {passNoMatch ? <ErrorLabel> Your passwords do not match</ErrorLabel> : ''}
                        <SignUp onClick={signUpAttempt}>Sign Up</SignUp>
                    </SignUpForm>


                    <Block pos={blockPos}>
                        {blockPos === 'right' && <BlockContent>
                            <BlockHeading>Hello, Why not sign up?</BlockHeading>
                            <GuestText>Sign up to get make orders and access order details. <br/> All your data will be kept safe</GuestText>
                            <BlockBtn onClick={() => setBlockPos('left')}>Register</BlockBtn>
                        </BlockContent> }
                        {blockPos === 'left' && <BlockContent>
                            <BlockHeading>Already have an account?</BlockHeading>
                            <GuestText>Already have an account? <br/> Use your personal credentials to sign into your account.</GuestText>
                            <BlockBtn onClick={() => setBlockPos('right')}>Sign in</BlockBtn>
                        </BlockContent> }
                    </Block>
                </FormContainer>
            </Container>
        </Wrapper>
    )
}

export default withRouter(LogInPage);

const Wrapper = styled.div`
    height: 100vh;
    background-image: url(${backgroundImg});
`
const GuestText = styled.p`
    font-size: 1rem;
    margin: 2rem 0;
`
const Container = styled.div`
    height: 100%;
    background-color: #000000b8;
    display:flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
`

const FormContainer = styled.div`
    display: flex;
    width: 80%;
    height: 90vh;
    border-radius: 20px 20px;
    position: relative;
    overflow: hidden;
`

const SignInForm = styled.form`
    display: flex;
    flex-direction: column;
    width: 50%;
    background-color: white;
    padding: 5rem 3rem;
    align-items: center;
    opacity: .95;
`
// const ForgotPassword = styled.a`
//     margin: 0 0 1rem 0;
//     color: #fffff
// `
const SignUpForm = styled(SignInForm)`
    padding-bottom: 5px;
`;
const Block = styled.div.attrs((props: {pos? : String}) => {

})`
    position: absolute;
    width: 45%;
    height: 100%;
    background-color: rgb(227, 93, 106, 1);
    transition: left right .5s;
    ${props => props.pos === 'right' ? (
        `right: 0`
    ):
    (
        `left: 0`
    )};
`
const BlockContent = styled.div`
    width: 80%;
    height: 90%;
    padding:2rem;
    display: flex;
    margin: auto;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const Heading = styled.div`
    color: rgb(54, 177, 155, 1);
    font-size: 32px;
    text-align: center;
    margin: 2px 0;
`
const BlockHeading = styled(Heading)`
    color: White;
`

const InputWrapper = styled.div`
        width: 100%;
        display:flex;
        justify-content: center;
        position: relative;
`

const TextInput = styled.input`
    height: 35px;
    width: 70%;
    margin: 30px 0;
    padding: 0 0 0 40px;
    &::placeholder{
        color: darkGray;
    }

    &:focus{
        border-bottom: blue 1px solid;
        transition: .5s;
    }
`
const SignUpTextInput = styled(TextInput)`
    margin: 15px; 0;
`;

const LogIn = styled.div`
    width: 10rem;
    height: 3rem;
    border-radius: 20px 20px;
    background-color: rgb(57, 177, 155, 1);
    margin: 0 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: .5s;
    color: white;

    &:hover{
        background-color: rgb(47, 139, 127, 1);
    }
`
const SignUp = styled(LogIn)`
    background-color: rgb(57, 177, 155, 1);
`
const BlockBtn = styled(LogIn)`
    background-color: rgb(57, 177, 155, 1);
`;

const ErrorLabel = styled.p`
    color: red;
    font: italic;
    margin: 0;
    padding: 0;
`;

const InputError = styled(ErrorLabel)`
    margin-top: -24px;
`;