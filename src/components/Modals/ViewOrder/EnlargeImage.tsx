import React, {useEffect, createRef, useState} from 'react';
import useImage from 'use-image';
import { Stage, Layer, Image } from 'react-konva';
import styled from 'styled-components';

interface Props {
    closeBtn: () => void;
    userEmail: string,
    ImgSrc: string, 
}

const EnlargeImage = ({closeBtn, userEmail, ImgSrc}: Props) => {
    const containerRef = createRef<HTMLDivElement>();
    const [height, setHeight] = useState<any>(0)
    const [width, setWidth] = useState<any>(0);

    const Schematic = () => {
        const [image] = useImage(ImgSrc);
        return <Image image={image} draggable />;
    }

    useEffect(()=> {
        setHeight(containerRef.current?.clientHeight);
        setWidth(containerRef.current?.clientWidth);
    })

    return(
        <Container ref={containerRef}>
            <Close onClick= { closeBtn }>
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </Close>

            <Stage width={width} height={height}>
                <Layer>
                    <Schematic />
                </Layer>
            </Stage>


        </Container>
    )
}

export default EnlargeImage;

const Container = styled.div`
    width: 100%;
    height: 100%;
    background-color: #cecece;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;

`;

const Close = styled.svg`
    position: absolute;
    right: 0;
    margin: 10px 20px 0 0;
    width:20px;
    height: 20px;
    z-index: 100;

    :hover {
        cursor: pointer;
        transition: .5s;
        color: blue;
    }

    path {
        fill: #80868b
    }
`;