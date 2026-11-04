import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { buscarDados } from './api';

export default function Home() {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Busca os dados da API assim que a tela abre
    buscarDados('usuarios') // muda 'usuarios' para o seu endpoint
      .then(resposta => setDados(resposta))
      .catch(erro => console.log(erro))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Página Home (Vivi Prof)</Text>
      
      {carregando ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text>Dados carregados da API com sucesso!</Text>
        /* Aqui depois faremos um loop para mostrar os dados na tela */
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
