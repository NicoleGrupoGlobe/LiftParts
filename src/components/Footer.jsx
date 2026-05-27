import React from 'react'
import logo from '../../assets/LogoLiftParts.svg'

export default function Footer() {
  return (
    <footer className="footer" id="footer" role="contentinfo">
      <div className="footer__inner">
        <div>
          <div className="footer__logo-row">
            <img src={logo} alt="Globe Lift Parts" className="footer__logo-img" />
            <p className="footer__logo">GLOBE <span className="accent">LIFT PARTS</span></p>
          </div>
          <address className="footer__address" style={{ fontStyle: 'normal' }}>
            Isidora Goyenechea 3520, Of. 300<br />
            Las Condes, Santiago, Chile
          </address>
        </div>
        <div className="footer__contact">
          <p>Contacto</p>
          <p><a href="mailto:contacto@grupoglobe.com">contacto@grupoglobe.com</a></p>
        </div>
        <p className="footer__copy">© 2026 Grupo Globe — Todos los derechos reservados</p>
      </div>
    </footer>
  )
}
