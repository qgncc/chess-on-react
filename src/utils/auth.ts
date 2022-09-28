const authLink = process.env.NODE_ENV === "development"?
    "http://localhost:8082/login"
    :
    "https://chess.qgncc.com/auth/login"

export default async function auth(login: string, password: string){
    const options: RequestInit = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({login: login,password: password}),
        
    }
    const result = await fetch( authLink, options)
    return result
}