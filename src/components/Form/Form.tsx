import "./Form.scss"


interface InputProps extends Attrs<"input">{
}

interface ButtonProps extends Attrs<"button">{
}

interface LabelProps extends Attrs<"label">{
}

type Attrs<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T]
interface FormProps extends Attrs<"form">{ }



export function Form({children, ...attrs}: FormProps) {
    return(
        <form className="form" {...attrs}>
            {children}
        </form>
    )
}

export function Input({children, className, ...attrs}: InputProps) {
    const classNameStr = className? className: ""

    return(
        <input className={"form__input "+classNameStr} {...attrs} />
    )
} 

export function Button({children, className, ...attrs}: ButtonProps) {
    const classNameStr = className? className: ""

    return(
        <button className={"button form__button "+classNameStr} {...attrs} >{children}</button>
    )
}
export function Label({children, className, ...attrs}: LabelProps){
    const classNameStr = className? className: ""

    return(
        <label className={"form__label "+classNameStr} {...attrs} >{children}</label>
    )
}