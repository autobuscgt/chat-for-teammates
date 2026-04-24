const ScreenMobile = ({children, isOpen, onClose}) =>{

    if (!isOpen) return null;
    <div>
        {children}
    </div>
}
export default ScreenMobile;