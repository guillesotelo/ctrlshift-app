import { useContext, useEffect, useState } from 'react';
import './styles.css'
import { AppContext } from '../../AppContext';

export default function Modal({ children, onClose, title, subtitle, style }) {
    const [closeAnimation, setCloseAnimation] = useState('')
    const { darkMode } = useContext(AppContext)

    const closeModal = () => {
        setCloseAnimation("close-animation")
        setTimeout(() => { if (onClose) onClose(); }, 200);
    };

    useEffect(() => {
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', closeOnEsc);
        return () => {
            document.removeEventListener('keydown', closeOnEsc);
        };
    }, []);

    return (
        <div className="modal__wrapper">
            <div className={`modal__container${darkMode ? '--dark' : ''} ${closeAnimation}`} style={style}>
                <div className="modal__header">
                    <div className="modal__titles">
                        <h1 className="modal__title">{title}</h1>
                        <h2 className="modal__subtitle">{subtitle}</h2>
                    </div>
                    <button className={`modal__close${darkMode ? '--dark' : ''}`} onClick={closeModal}>X</button>
                </div>
                <div className="modal__content">
                    {children}
                </div>
            </div>
        </div>
    );
}
