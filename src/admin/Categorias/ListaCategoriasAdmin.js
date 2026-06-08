// src/admin/Categorias/ListaCategoriasAdmin.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import { collection, getDocs, deleteDoc, doc, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Link } from 'react-router-dom';

export default function ListaCategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarCategorias = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const snapshot = await getDocs(collection(db, 'categorias'));

        const lista = await Promise.all(
          snapshot.docs.map(async (docCat) => {
            const catData = docCat.data();

            if (!catData.slug || typeof catData.slug !== 'string') {
              return null;
            }

            const produtosRef = collection(db, 'produtos');
            const q = query(produtosRef, where('categoria', '==', catData.slug));
            const countSnapshot = await getCountFromServer(q);

            return {
              id: docCat.id,
              ...catData,
              totalProdutos: countSnapshot.data().count || 0
            };
          })
        );

        setCategorias(lista.filter(Boolean));
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setErro('Erro ao carregar categorias.');
      } finally {
        setCarregando(false);
      }
    };

    carregarCategorias();
  }, []);

  const excluirCategoria = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await deleteDoc(doc(db, 'categorias', id));
      setCategorias((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      alert('Erro ao excluir categoria.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>📁 Categorias</h4>
        <Button as={Link} to="/admin/categorias/nova" variant="success">
          + Nova Categoria
        </Button>
      </div>

      {erro && <Alert variant="danger">{erro}</Alert>}
      {carregando ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Slug</th>
              <th>Imagem</th>
              <th>Qtd. Produtos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.nome}</td>
                <td>{cat.slug}</td>
                <td>
                  {cat.imagem ? (
                    <img
                      src={cat.imagem}
                      alt={cat.nome}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover', borderRadius: '5px' }}
                    />
                  ) : (
                    '—'
                  )}
                </td>
                <td>{cat.totalProdutos}</td>
                <td>
                  <Button
                    as={Link}
                    to={`/admin/categorias/editar/${cat.id}`}
                    size="sm"
                    variant="warning"
                    className="me-2"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => excluirCategoria(cat.id)}
                    size="sm"
                    variant="danger"
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
