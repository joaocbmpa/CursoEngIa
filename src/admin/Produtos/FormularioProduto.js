// src/admin/Produtos/FormularioProduto.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Image, Alert } from 'react-bootstrap';
import { db, storage } from '../../firebase/config';
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function FormularioProduto() {
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    categoria: '',
    variacoes: '',
    imagens: [],
    imagemPrincipal: 0,
    digital: false,
    arquivoUrl: '',
    peso: '',
    altura: '',
    largura: '',
    comprimento: ''
  });

  const [imagemFiles, setImagemFiles] = useState([]);
  const [arquivoDigital, setArquivoDigital] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const carregarProduto = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'produtos', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            ...data,
            variacoes: data.variacoes?.join(', ') || '',
            imagemPrincipal: data.imagens?.indexOf(data.imagemPrincipal) || 0,
            imagens: data.imagens || [],
            digital: data.digital || false,
            arquivoUrl: data.arquivoUrl || '',
            peso: data.peso || '',
            altura: data.altura || '',
            largura: data.largura || '',
            comprimento: data.comprimento || ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
      }
    };
    carregarProduto();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImagemFiles([...imagemFiles, ...files]);
  };

  const handleRemoveImage = (index) => {
    const novasImagens = [...form.imagens];
    novasImagens.splice(index, 1);
    setForm({ ...form, imagens: novasImagens });
  };

  const handleRemoveNewFile = (index) => {
    const novasFiles = [...imagemFiles];
    novasFiles.splice(index, 1);
    setImagemFiles(novasFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMensagem(null);

    try {
      const uploadPromises = imagemFiles.map(async (file) => {
        const refImg = ref(storage, `produtos/${uuidv4()}-${file.name}`);
        await uploadBytes(refImg, file);
        return await getDownloadURL(refImg);
      });

      const novasURLs = await Promise.all(uploadPromises);
      const todasImagens = [...(form.imagens || []), ...novasURLs];

      let urlArquivo = form.arquivoUrl;
      if (form.digital && arquivoDigital) {
        const refPdf = ref(storage, `ebooks/${uuidv4()}-${arquivoDigital.name}`);
        await uploadBytes(refPdf, arquivoDigital);
        urlArquivo = await getDownloadURL(refPdf);
      }

      const produto = {
        nome: form.nome,
        descricao: form.descricao,
        preco: parseFloat(form.preco),
        estoque: parseInt(form.estoque),
        categoria: form.categoria.toLowerCase(),
        variacoes: form.variacoes ? form.variacoes.split(',').map(v => v.trim()) : [],
        imagens: todasImagens,
        imagemPrincipal: todasImagens[form.imagemPrincipal] || todasImagens[0],
        digital: form.digital,
        arquivoUrl: form.digital ? urlArquivo : '',
        peso: form.peso,
        altura: form.altura,
        largura: form.largura,
        comprimento: form.comprimento,
        atualizadoEm: serverTimestamp()
      };

      if (id) {
        await updateDoc(doc(db, 'produtos', id), produto);
        setMensagem('✅ Produto atualizado com sucesso!');
      } else {
        produto.criadoEm = serverTimestamp();
        await addDoc(collection(db, 'produtos'), produto);
        setMensagem('✅ Produto cadastrado com sucesso!');
      }

      setTimeout(() => navigate('/admin/produtos'), 2000);
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setMensagem('❌ Erro ao salvar produto.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3 bg-light rounded">
      <h4>{id ? 'Editar Produto' : 'Cadastro de Produto'}</h4>
      {mensagem && <Alert variant="info">{mensagem}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Nome</Form.Label>
        <Form.Control name="nome" value={form.nome} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Descrição</Form.Label>
        <Form.Control as="textarea" name="descricao" value={form.descricao} onChange={handleChange} required />
      </Form.Group>

      <Row className="mb-3">
        <Col>
          <Form.Label>Preço (R$)</Form.Label>
          <Form.Control type="number" name="preco" value={form.preco} onChange={handleChange} required />
        </Col>
        <Col>
          <Form.Label>Estoque</Form.Label>
          <Form.Control type="number" name="estoque" value={form.estoque} onChange={handleChange} required />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Label>Peso (kg)</Form.Label>
          <Form.Control type="number" name="peso" value={form.peso} onChange={handleChange} required />
        </Col>
        <Col>
          <Form.Label>Altura (cm)</Form.Label>
          <Form.Control type="number" name="altura" value={form.altura} onChange={handleChange} required />
        </Col>
        <Col>
          <Form.Label>Largura (cm)</Form.Label>
          <Form.Control type="number" name="largura" value={form.largura} onChange={handleChange} required />
        </Col>
        <Col>
          <Form.Label>Comprimento (cm)</Form.Label>
          <Form.Control type="number" name="comprimento" value={form.comprimento} onChange={handleChange} required />
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Categoria</Form.Label>
        <Form.Control name="categoria" value={form.categoria} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Variações (separadas por vírgula)</Form.Label>
        <Form.Control name="variacoes" value={form.variacoes} onChange={handleChange} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          name="digital"
          label="Este produto é um eBook (digital)?"
          checked={form.digital}
          onChange={handleChange}
        />
      </Form.Group>

      {form.digital && (
        <Form.Group className="mb-3">
          <Form.Label>Upload do Arquivo PDF</Form.Label>
          <Form.Control
            type="file"
            accept="application/pdf"
            onChange={(e) => setArquivoDigital(e.target.files[0])}
          />
          {form.arquivoUrl && !arquivoDigital && (
            <p className="mt-2 text-success">📎 Já cadastrado: <a href={form.arquivoUrl} target="_blank" rel="noreferrer">ver arquivo</a></p>
          )}
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Adicionar novas imagens</Form.Label>
        <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
      </Form.Group>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {form.imagens.map((url, idx) => (
          <div key={idx} className="position-relative">
            <Image src={url} thumbnail width={100} height={100} style={{ border: idx === form.imagemPrincipal ? '3px solid green' : '1px solid #ccc' }} />
            <Button size="sm" variant="danger" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: 0, right: 0 }}>x</Button>
          </div>
        ))}
        {imagemFiles.map((file, idx) => (
          <div key={`file-${idx}`} className="position-relative">
            <Image src={URL.createObjectURL(file)} thumbnail width={100} height={100} />
            <Button size="sm" variant="danger" onClick={() => handleRemoveNewFile(idx)} style={{ position: 'absolute', top: 0, right: 0 }}>x</Button>
          </div>
        ))}
      </div>

      {(form.imagens.length + imagemFiles.length > 0) && (
        <Form.Group className="mb-3">
          <Form.Label>Imagem Principal</Form.Label>
          <Form.Select value={form.imagemPrincipal} onChange={(e) => setForm({ ...form, imagemPrincipal: Number(e.target.value) })}>
            {[...form.imagens, ...imagemFiles].map((img, index) => (
              <option key={index} value={index}>
                {typeof img === 'string' ? img.split('/').pop() : img.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      <Button type="submit" disabled={uploading} className="mt-3">
        {uploading ? 'Salvando...' : 'Salvar Produto'}
      </Button>
    </Form>
  );
}
