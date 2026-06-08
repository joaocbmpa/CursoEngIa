// src/services/storageService.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Faz upload de um arquivo no Storage e retorna a URL pública.
 * @param {File} file - Arquivo a ser enviado
 * @param {string} pasta - Caminho da pasta dentro do bucket (ex: 'categorias', 'produtos')
 * @returns {Promise<string>} - URL pública da imagem
 */
export const enviarImagem = async (file, pasta = 'geral') => {
  try {
    const caminho = `${pasta}/${uuidv4()}-${file.name}`;
    const storageRef = ref(storage, caminho);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    console.log(`✅ Imagem enviada para: ${caminho}`);
    console.log(`🌐 URL pública: ${url}`);

    return url;
  } catch (error) {
    console.error('❌ Erro ao enviar imagem:', error);
    throw error;
  }
};
