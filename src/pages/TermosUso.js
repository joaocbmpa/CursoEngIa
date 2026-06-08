// src/pages/TermosUso.js
import React from 'react';
import { Container } from 'react-bootstrap';

export default function TermosUso() {
  return (
    <Container className="my-5">
      <h1 className="mb-4 text-center">📜 Termos de Uso</h1>
      <p>Bem-vindo à <strong>Xadrez JL</strong>. Ao acessar e utilizar nosso site, você concorda com os seguintes termos e condições:</p>

      <h5 className="mt-4">1. Aceitação dos Termos</h5>
      <p>Ao navegar em nosso site ou realizar uma compra, você declara que leu, compreendeu e aceitou estes Termos de Uso e nossa Política de Privacidade.</p>

      <h5 className="mt-4">2. Uso do Site</h5>
      <p>Você concorda em utilizar nosso site apenas para finalidades lícitas, não violando direitos de terceiros ou normas legais vigentes.</p>

      <h5 className="mt-4">3. Propriedade Intelectual</h5>
      <p>Todo o conteúdo deste site, incluindo imagens, textos, logotipos e ilustrações, é de propriedade exclusiva da Xadrez JL. É proibida a reprodução sem autorização prévia.</p>

      <h5 className="mt-4">4. Compras e Pagamentos</h5>
      <p>As compras realizadas na Xadrez JL são intermediadas por plataformas seguras como Mercado Pago. O cliente se compromete a fornecer dados corretos e completos durante o processo.</p>

      <h5 className="mt-4">5. Alterações nos Termos</h5>
      <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Recomendamos que você revise esta página periodicamente.</p>

      <h5 className="mt-4">6. Contato</h5>
      <p>Em caso de dúvidas, entre em contato conosco através do WhatsApp (91) 98326-1572 ou e-mail <a href="mailto:joaoluizcbmpa@gmail.com">joaoluizcbmpa@gmail.com</a>.</p>

      <p className="mt-5 text-muted text-center">Última atualização: Abril de 2025</p>
    </Container>
  );
}
