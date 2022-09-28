import "./Registration.scss"
import { BlackBox } from "../../components/BlackBox/BlackBox"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import { Button, Form, Input, Label } from "../../components/Form/Form"
import register from "../../utils/register"
import ErrorMessage from "../../components/Error"



export function Registration(){
    const isLoggedIn = useSelector<RootState, boolean>(state=>state.auth.isLoggedIn)
    const [loginInput, setLoginInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const [passwordRepeatInput, setPasswordRepeatInput] = useState("")
    const [registrationError, setRegistrationError] = useState<string|null>(null)
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams();


    async function onSubmit(event: FormEvent) {
        event.preventDefault()
        if(passwordInput === passwordRepeatInput){
            const result = await register(loginInput, passwordInput)
            if(result.status === 200){
                navigate("/")
            }else{
                const json = await result.json()
                result.body && setRegistrationError(json.message)
            }
        }else{
            setRegistrationError("Passwords are not equal")
        }
    }

    useEffect(()=>{
        if(isLoggedIn){
            const redirect = searchParams.get("redirect")
            console.log(redirect)
            if(redirect){
                navigate(redirect)
            }else{
                navigate("/play")
            }
        }
    }, [isLoggedIn])

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        if(event.target.id === "login"){
            setLoginInput(event.target.value)
        }
        if(event.target.id === "password"){
            setPasswordInput(event.target.value)
        }
        if(event.target.id === "passwordRepeat"){
            setPasswordRepeatInput(event.target.value)
        }
    }

    return (
        <BlackBox>
            <Form onSubmit={onSubmit}>
                <h1 className="auth__title">Registration</h1>
                {registrationError !== ""?<ErrorMessage>{registrationError}</ErrorMessage>: null}
                <Label className="auth__label">
                    login
                    <Input id="login" value={loginInput} onChange={onChange} type="text"/>
                </Label>
                <Label className="auth__label">
                    password
                    <Input id="password" value={passwordInput} onChange={onChange} type="password"/>
                </Label>
                <Label className="auth__label">
                    repeat password
                    <Input id="passwordRepeat" value={passwordRepeatInput} onChange={onChange} type="password"/>
                </Label>
                <Button className="button auth__button">Sign up</Button>
            </Form>
        </BlackBox>
    )
}