// src/admin/Categorias/CadastroCategoria.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Image } from 'react-bootstrap';
import { db } from '../../firebase/config';
import { addDoc, collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { enviarImagem } from '../../services/storageService';

export default function CadastroCategoria() {
  const [form, setForm] = useState({ nome: '', slug: '', imagem: '' });
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const carregarCategoria = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'categorias', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForm({ ...docSnap.data(), imagem: docSnap.data().imagem || '' });
          console.log('📄 Categoria carregada:', docSnap.data());
        }
      } catch (error) {
        console.error('❌ Erro ao buscar categoria:', error);
      }
    };
    carregarCategoria();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    try {
      // Valor inicial da imagem
      let imagemURL = form.imagem || '';

      // Verifica se uma nova imagem foi selecionada
      const fileInput = document.querySelector('input[type="file"]');
      const file = fileInput?.files?.[0];
      console.log("📁 Imagem selecionada:", file);

      if (file) {
        imagemURL = await enviarImagem(file, 'categorias');
      }

      console.log("🔗 URL final da imagem a ser salva:", imagemURL);

      // Monta objeto com ou sem imagem
      const dadosCategoria = {
        nome: form.nome,
        slug: form.slug,
      };

      if (imagemURL) {
        dadosCategoria.imagem = imagemURL;
      }

      console.log("🧾 Dados a salvar no Firestore:", dadosCategoria);

      if (id) {
        await updateDoc(doc(db, 'categorias', id), dadosCategoria);
        setMensagem('✅ Categoria atualizada com sucesso!');
      } else {
        await addDoc(collection(db, 'categorias'), dadosCategoria);
        setMensagem('✅ Categoria cadastrada com sucesso!');
      }

      setTimeout(() => navigate('/admin/categorias'), 2000);
    } catch (error) {
      console.error('❌ Erro ao salvar categoria:', error);
      setMensagem('❌ Ocorreu um erro ao salvar.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">{id ? '✏️ Editar Categoria' : '📁 Nova Categoria'}</h2>
      {mensagem && <Alert variant="info">{mensagem}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Slug (URL)</Form.Label>
          <Form.Control
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Imagem da Categoria</Form.Label>
          <Form.Control type="file" accept="image/*" />
          {form.imagem && (
            <div className="mt-2">
              <Image src={form.imagem} alt="Imagem atual" thumbnail width={120} />
              <p className="small text-muted">Imagem atual</p>
            </div>
          )}
        </Form.Group>

        <Button type="submit" variant="success" disabled={carregando}>
          {carregando ? 'Salvando...' : 'Salvar Categoria'}
        </Button>
      </Form>
    </Container>
  );
}
