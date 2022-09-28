import "./AuthScreen.scss"
import { BlackBox } from "../../components/BlackBox/BlackBox"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { login } from "../../redux/features/authSlice"
import { useDispatch } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import auth from "../../utils/auth"
import { Button, Form, Input, Label } from "../../components/Form/"
import ErrorMessage from "../../components/Error"



export function AuthScreen(){
    const isLoggedIn = useSelector<RootState, boolean>(state=>state.auth.isLoggedIn)
    const [loginInput, setLoginInput] = useState("")
    const [passwordInput, setPasswordInput] = useState("")
    const [authError, setAuthError] = useState("")
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams();


    async function onSubmit(event: FormEvent) {
        event.preventDefault()
        const result = await auth(loginInput, passwordInput)
        if(result.status === 200){
            dispatch(login(loginInput))
        }else{
            const json = await result.json()
            result.body && setAuthError(json.message)
        }
    }

    function onRegistration() {
        navigate("/registration")
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
    }

    return (
        <BlackBox>
            <Form>
                <h1 className="auth__title">Authentication</h1>
                {authError !== "" && <ErrorMessage>{authError}</ErrorMessage>}
                <Label>
                    login
                    <Input id="login" value={loginInput} onChange={onChange} type="text"/>
                </Label>
                <Label>
                    password
                    <Input id="password" value={passwordInput} onChange={onChange} type="password"/>
                </Label>
                <Button onClick={onSubmit}>Sign In</Button>
                <Button onClick={onRegistration} className="button--blue">Registration</Button>
            </Form>
        </BlackBox>
    )
}