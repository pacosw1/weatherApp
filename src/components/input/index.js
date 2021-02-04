import styled from "styled-components"


const InputContainer = styled.div`
    position: relative;
    border-color: ${({error, border}) => "1px " + error ? 'red' : {border}};
    width: inherit;
    padding: .25rem 0;
    display: flex;
    flex-direction: column;
    text-align: left;


`


const Input = styled.input`
    box-sizing: border-box;
    border: ${({error}) => `1px solid ${error ? 'red' : '#ddd'}`};
    type: ${({type}) => type};
    margin: .2rem 0;
    height: ${({height}) => height ? height : 4}rem;
    placeholder: ${({label}) => label};
    font-family: "Roboto", sans-serif;
    outline-color: rgb(12, 185, 113);
    font-weight: 300;
    border-radius: 0.2rem;
    width: 100%;
    color: rgb(0, 0, 0);
    font-size: 1rem;
    padding-left: 0.8rem;
`


export {Input}

