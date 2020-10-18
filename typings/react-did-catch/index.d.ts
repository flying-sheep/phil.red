declare module 'react-did-catch' {
    import { BrowserInfo } from 'detect-browser'
    
    interface CatchErrorProps {
        render?: (error: Error, info: React.ErrorInfo, browser: BrowserInfo) => React.ReactNode
    }
    export default function CatchError(
        props: CatchErrorProps & {children: React.ReactNode}
    ): React.ReactElement<CatchErrorProps>
    
    interface ErrorMessageProps {
        error: Error
        info: React.ErrorInfo
        customStyles?: {
            container?: React.CSSProperties
            errorMessage?: React.CSSProperties
            componentStack?: React.CSSProperties
            browserInfo?: React.CSSProperties
            arrow?: React.CSSProperties
        }
    }
    export function ErrorMessage(
        props: ErrorMessageProps & {children: React.ReactNode}
    ): React.ReactElement<ErrorMessageProps>
}
