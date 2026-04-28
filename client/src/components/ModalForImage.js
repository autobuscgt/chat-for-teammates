import '../styles.css'
const ModalForImage = ({image, isOpen, onClose, baseURL}) =>{
    const handleClose = () => {
        onClose();
    }
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={handleClose}>
            <img src={`${baseURL}${image}`}  alt="message-photo" className="modal-image"/>
        </div>
    )
}
export default ModalForImage;