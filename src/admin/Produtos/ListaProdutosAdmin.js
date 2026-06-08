import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Alert, Image } from 'react-bootstrap';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function ListaProdutosAdmin() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setCarregando(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'produtos'));
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProdutos(lista);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setErro('Erro ao carregar os produtos.');
    } finally {
      setCarregando(false);
    }
  };

  const excluirImagens = async (urls) => {
    const promises = urls.map(async (url) => {
      try {
        const path = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
        const imgRef = ref(storage, path);
        await deleteObject(imgRef);
      } catch (err) {
        console.warn('Erro ao excluir imagem:', err);
      }
    });
    await Promise.all(promises);
  };

  const excluirProduto = async (id, imagens = []) => {
    try {
      if (!window.confirm("Deseja realmente excluir este produto?")) return;

      await excluirImagens(imagens);
      await deleteDoc(doc(db, "produtos", id));
      setProdutos(produtos.filter(produto => produto.id !== id));
    } catch (err) {
      alert("Erro ao excluir produto.");
      console.error(err);
    }
  };

  return (
    <div className="container py-4">
      <h2>Produtos Cadastrados</h2>

      {carregando && <Spinner animation="border" />}
      {erro && <Alert variant="danger">{erro}</Alert>}

      {!carregando && produtos.length === 0 && (
        <Alert variant="info">Nenhum produto cadastrado.</Alert>
      )}

      <Table striped bordered hover responsive className="mt-4">
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td>
                <Image
                  src={produto.imagens?.[0] || '/placeholder.jpg'}
                  alt={produto.nome}
                  thumbnail
                  width={60}
                />
              </td>
              <td>{produto.nome}</td>
              <td>R$ {Number(produto.preco).toFixed(2)}</td>
              <td>{produto.categoria}</td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  className="me-2"
                  onClick={() => navigate(`/admin/produtos/editar/${produto.id}`)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => excluirProduto(produto.id, produto.imagens)}
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
