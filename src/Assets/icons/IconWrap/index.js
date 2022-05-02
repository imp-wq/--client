import styled from 'styled-components';

export default styled.div`
    position: absolute;
    top: 1.8rem;
    left: 18%;
    opacity: 0.7;
    margin-top: ${props => props.pushUp ? '-15px' : ''};
`;