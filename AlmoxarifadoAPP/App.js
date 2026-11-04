import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  FlatList,
  Switch
} from 'react-native';

const API_URL = 'http://10.154.20.42:5000';

// Definição das abas do menu de navegação superior
const MENU = [
  ['usuarios', 'Adicionar Usuário'],
  ['almoxarifado', 'Ver Estoque'],
  ['add_item', 'Adicionar Item'],
  ['retirada', 'Retirar Item'],
];

export default function App() {
  // Estados Globais de Sessão e Navegação
  const [logado, setLogado] = useState(false);
  const [telaAtiva, setTelaAtiva] = useState('usuarios'); // Começa na tela de usuários pós-login

  // Estados do Formulário de Login
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Estados da Tela de Adicionar Usuário
  const [novoUsuario, setNovoUsuario] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Estados da Tela de Almoxarifado (Estoque)
  const [listaEstoque, setListaEstoque] = useState([]);
  const [atualizandoEstoque, setAtualizandoEstoque] = useState(false);

  // Estados da Tela de Adicionar Item
  const [nomeItem, setNomeItem] = useState('');
  const [qtdItem, setQtdItem] = useState('');

  // Estados da Tela de Retirada
  const [idItemRetirada, setIdItemRetirada] = useState('');
  const [qtdRetirada, setQtdRetirada] = useState('');

  // ==========================================
  // REQUISIÇÕES DA API
  // ==========================================

  // 1. Função de Login Original Preservada
  const lidarComLogin = async () => {
    if (!usuario || !senha) {
      Alert.alert('Aviso', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      setCarregando(true);
      const resposta = await fetch(`${API_URL}/api/fazer_login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuario, senha: senha })
      });

      const data = await resposta.json();

      if (resposta.ok && data.status === 'sucesso') {
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        setLogado(true);
        setTelaAtiva('usuarios'); // Força ir para a tela de adicionar pessoas
      } else {
        Alert.alert('Falha no Login', data.mensagem || 'Usuário ou senha incorretos.');
      }
    } catch (erro) {
      console.error(erro);
      Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor do almoxarifado.');
    } finally {
      setCarregando(false);
    }
  };

  // 2. Buscar Estoque do Servidor
  const carregarEstoque = async () => {
    try {
      setAtualizandoEstoque(true);
      const resposta = await fetch(`${API_URL}/api/estoque`);
      const data = await resposta.json();
      
      if (resposta.ok) {
        setListaEstoque(data.itens || data); 
      } else {
        Alert.alert('Erro', data.mensagem || 'Não foi possível carregar o estoque.');
      }
    } catch (erro) {
      console.error(erro);
      Alert.alert('Erro', 'Falha ao buscar dados do estoque no servidor.');
    } finally {
      setAtualizandoEstoque(false);
    }
  };

  // Carrega o estoque automaticamente sempre que o usuário entrar na aba Almoxarifado
  useEffect(() => {
    if (logado && telaAtiva === 'almoxarifado') {
      carregarEstoque();
    }
  }, [telaAtiva, logado]);

  // 3. Cadastrar Novo Usuário (Adicionar Pessoas)
  const lidarComCadastroUsuario = async () => {
    if (!novoUsuario.trim() || !novaSenha) {
      Alert.alert('Aviso', 'Preencha o nome de usuário e a senha.');
      return;
    }
    try {
      const resposta = await fetch(`${API_URL}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: novoUsuario.trim(),
          senha: novaSenha,
          perfil: isAdmin ? 'admin' : 'comum'
        })
      });
      const data = await resposta.json();
      if (resposta.ok) {
        Alert.alert('Sucesso', 'Novo usuário registrado com sucesso!');
        setNovoUsuario(''); setNovaSenha(''); setIsAdmin(false);
      } else {
        Alert.alert('Erro', data.mensagem || 'Não foi possível criar o usuário.');
      }
    } catch (erro) {
      Alert.alert('Erro de Rede', 'Servidor indisponível.');
    }
  };

  // 4. Cadastrar Novo Item no Estoque
  const lidarComCadastroItem = async () => {
    if (!nomeItem.trim() || !qtdItem) {
      Alert.alert('Aviso', 'Preencha o nome do item e a quantidade.');
      return;
    }
    try {
      const resposta = await fetch(`${API_URL}/api/estoque`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeItem.trim(), quantidade: parseInt(qtdItem) })
      });
      const data = await resposta.json();
      if (resposta.ok) {
        Alert.alert('Sucesso', 'Item adicionado ao estoque!');
        setNomeItem(''); setQtdItem('');
      } else {
        Alert.alert('Erro', data.mensagem || 'Falha ao cadastrar item.');
      }
    } catch (erro) {
      Alert.alert('Erro de Rede', 'Não foi possível salvar o produto.');
    }
  };

  // 5. Registrar Retirada/Baixa de Item
  const lidarComRetiradaItem = async () => {
    if (!idItemRetirada || !qtdRetirada) {
      Alert.alert('Aviso', 'Informe o ID do item e a quantidade que deseja retirar.');
      return;
    }
    try {
      const resposta = await fetch(`${API_URL}/api/movimentar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idItemRetirada, quantidade: parseInt(qtdRetirada), tipo: 'saida' })
      });
      const data = await resposta.json();
      if (resposta.ok) {
        Alert.alert('Sucesso', 'Retirada efetuada e registrada!');
        setIdItemRetirada(''); setQtdRetirada('');
      } else {
        Alert.alert('Erro', data.mensagem || 'Quantidade insuficiente ou item inválido.');
      }
    } catch (erro) {
      Alert.alert('Erro de Rede', 'Não foi possível registrar a movimentação.');
    }
  };

  // Logout do sistema
  const fazerLogout = () => {
    setLogado(false);
    setUsuario('');
    setSenha('');
  };

  // ==========================================
  // RENDERIZAÇÃO DE TELAS INTERNES
  // ==========================================

  // Se o usuário NÃO está logado, exibe sua tela de Login original intacta
  if (!logado) {
    return (
      <View style={styles.fundo}>
        <View style={styles.overlay} />
        <View style={styles.loginContainer}>
          <View style={styles.logoArea}><Text style={styles.logoTexto}>SENAI</Text></View>
          <Text style={styles.tituloHeader}>Sistema</Text>
          <Text style={styles.subtitulo}>Faça login para acessar o almoxarifado</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Usuário:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu usuário"
              placeholderTextColor="#ccc"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Senha:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#ccc"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.btnSubmit} onPress={lidarComLogin} disabled={carregando}>
            {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTexto}>Entrar</Text>}
          </TouchableOpacity>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  // Se o usuário ESTÁ logado, renderiza o Dashboard com Menu e as Telas Internas
  return (
    <View style={styles.containerDashboard}>
      {/* Cabeçalho do Dashboard */}
      <View style={styles.navbar}>
        <Text style={styles.navbarLogo}>SENAI</Text>
        <TouchableOpacity onPress={fazerLogout} style={styles.btnSair}>
          <Text style={styles.btnSairTexto}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Superior Deslizante */}
      <View style={styles.menuContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MENU.map(([chave, nome]) => (
            <TouchableOpacity 
              key={chave} 
              onPress={() => setTelaAtiva(chave)}
              style={[styles.menuLink, telaAtiva === chave && styles.menuLinkAtivo]}
            >
              <Text style={[styles.menuTexto, telaAtiva === chave && styles.menuTextoAtivo]}>{nome}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Renderização Condicional das Telas Baseado na Aba Ativa */}
      <View style={styles.conteudoTela}>
        
        {/* Tela: Adicionar Pessoas / Usuários */}
        {telaAtiva === 'usuarios' && (
          <View style={styles.cardInterno}>
            <Text style={styles.tituloInterno}>Adicionar Novo Usuário</Text>
            <View style={styles.formGroup}>
              <Text style={styles.labelInterno}>Nome de Usuário:</Text>
              <TextInput style={styles.inputInterno} placeholder="Ex: joao.silva" value={novoUsuario} onChangeText={setNovoUsuario} autoCapitalize="none" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.labelInterno}>Senha do Usuário:</Text>
