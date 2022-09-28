const registerLink = process.env.NODE_ENV === "development"?
    "http://localhost:8082/registration"
    :
    "https://chess.qgncc.com/auth/registration"

export default async function register(login: string, password: string){
    const options: RequestInit = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({login: login,password: password}),
        
    }
    const result = await fetch( registerLink, options)
    return result
}