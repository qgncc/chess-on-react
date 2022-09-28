import "./ErrorMessage.scss"


export function ErrorMessage({children, className}: JSX.IntrinsicElements["h1"]) {
    const classNameStr = className? className:""
    
    return(
        <h1 className={"error"+classNameStr}>
            {children}
        </h1>
    )
}