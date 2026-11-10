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

const API_URL = 'http://172.20.208.1:5000';

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
  const [telaAtiva, setTelaAtiva] = useState('usuarios');

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
        setTelaAtiva('usuarios');
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

  useEffect(() => {
    if (logado && telaAtiva === 'almoxarifado') {
      carregarEstoque();
    }
  }, [telaAtiva, logado]);

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

  const fazerLogout = () => {
    setLogado(false);
    setUsuario('');
    setSenha('');
  };

  // ==========================================
  // RENDERIZAÇÃO DE TELAS
  // ==========================================

  if (!logado) {
    return (
      <View style={styles.fundo}>
        <View style={styles.loginContainer}>
          <View style={styles.logoArea}><Text style={styles.logoTexto}>SENAI</Text></View>
          <Text style={styles.tituloHeader}>Sistema</Text>
          <Text style={styles.subtitulo}>Faça login para acessar o almoxarifado</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Usuário:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu usuário"
              placeholderTextColor="#888"
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
              placeholderTextColor="#888"
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

  return (
    <View style={styles.containerDashboard}>
      {/* Cabeçalho do Dashboard */}
      <View style={styles.navbar}>
        <Text style={styles.navbarLogo}>SENAI - Almoxarifado</Text>
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

      {/* Conteúdo Dinâmico */}
      <ScrollView contentContainerStyle={styles.conteudoTela}>
        
        {/* Tela: Adicionar Usuário */}
        {telaAtiva === 'usuarios' && (
          <View style={styles.cardInterno}>
            <Text style={styles.tituloInterno}>Adicionar Novo Usuário</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.labelInterno}>Nome de Usuário:</Text>
              <TextInput style={styles.inputInterno} placeholder="Ex: joao.silva" placeholderTextColor="#888" value={novoUsuario} onChangeText={setNovoUsuario} autoCapitalize="none" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.labelInterno}>Senha do Usuário:</Text>
              <TextInput style={styles.inputInterno} placeholder="Digite a senha" placeholderTextColor="#888" secureTextEntry value={novaSenha} onChangeText={setNovaSenha} autoCapitalize="none" />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.labelInterno}>Perfil Administrador?</Text>
              <Switch value={isAdmin} onValueChange={setIsAdmin} />
            </View>

            <TouchableOpacity style={styles.btnAcao} onPress={lidarComCadastroUsuario}>
              <Text style={styles.btnTexto}>Cadastrar Usuário</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tela: Ver Estoque */}
        {telaAtiva === 'almoxarifado' && (
          <View style={styles.cardInterno}>
            <View style={styles.estoqueHeader}>
              <Text style={styles.tituloInterno}>Estoque Atual</Text>
              <TouchableOpacity onPress={carregarEstoque} style={styles.btnAtualizar}>
                <Text style={styles.btnAtualizarTexto}>Atualizar</Text>
              </TouchableOpacity>
            </View>

            {atualizandoEstoque ? (
              <ActivityIndicator size="large" color="#0056b3" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={listaEstoque}
                keyExtractor={(item, index) => String(item.id || index)}
                scrollEnabled={false}
                ListEmptyComponent={<Text style={styles.textoVazio}>Nenhum item cadastrado no estoque.</Text>}
                renderItem={({ item }) => (
                  <View style={styles.itemEstoqueCard}>
                    <View>
                      <Text style={styles.itemNome}>{item.nome || item.descricao}</Text>
                      <Text style={styles.itemId}>ID: {item.id}</Text>
                    </View>
                    <View style={styles.badgeQtd}>
                      <Text style={styles.badgeTexto}>{item.quantidade} un</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* Tela: Adicionar Item */}
        {telaAtiva === 'add_item' && (
          <View style={styles.cardInterno}>
            <Text style={styles.tituloInterno}>Adicionar Novo Item ao Estoque</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.labelInterno}>Nome do Produto:</Text>
              <TextInput style={styles.inputInterno} placeholder="Ex: Chave de Fenda" placeholderTextColor="#888" value={nomeItem} onChangeText={setNomeItem} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.labelInterno}>Quantidade Inicial:</Text>
              <TextInput style={styles.inputInterno} placeholder="Ex: 10" placeholderTextColor="#888" keyboardType="numeric" value={qtdItem} onChangeText={setQtdItem} />
            </View>

            <TouchableOpacity style={styles.btnAcao} onPress={lidarComCadastroItem}>
              <Text style={styles.btnTexto}>Salvar Item</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tela: Retirar Item */}
        {telaAtiva === 'retirada' && (
          <View style={styles.cardInterno}>
            <Text style={styles.tituloInterno}>Registrar Retirada de Item</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.labelInterno}>ID do Item:</Text>
              <TextInput style={styles.inputInterno} placeholder="Ex: 1" placeholderTextColor="#888" keyboardType="numeric" value={idItemRetirada} onChangeText={setIdItemRetirada} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.labelInterno}>Quantidade a Retirar:</Text>
              <TextInput style={styles.inputInterno} placeholder="Ex: 2" placeholderTextColor="#888" keyboardType="numeric" value={qtdRetirada} onChangeText={setQtdRetirada} />
            </View>

            <TouchableOpacity style={styles.btnAcaoPerigo} onPress={lidarComRetiradaItem}>
              <Text style={styles.btnTexto}>Confirmar Retirada</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ==========================================
// ESTILOS DO APLICATIVO
// ==========================================

const styles = StyleSheet.create({
  // Tela de Login
  fundo: {
    flex: 1,
    backgroundColor: '#003366', // Azul institucional corporativo
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logoArea: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  logoTexto: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003366',
    letterSpacing: 2,
  },
  tituloHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Formulários Gerais
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  btnSubmit: {
    backgroundColor: '#0056b3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Dashboard e Navegação
  containerDashboard: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#003366',
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navbarLogo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnSair: {
    backgroundColor: '#cc0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnSairTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  menuLink: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#eef2f7',
  },
  menuLinkAtivo: {
    backgroundColor: '#0056b3',
  },
  menuTexto: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  menuTextoAtivo: {
    color: '#fff',
  },

  // Conteúdo e Cards Internos
  conteudoTela: {
    padding: 16,
  },
  cardInterno: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  tituloInterno: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 16,
  },
  labelInterno: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  inputInterno: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  btnAcao: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnAcaoPerigo: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  // Listagem de Estoque
  estoqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnAtualizar: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnAtualizarTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  itemEstoqueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemId: {
    fontSize: 12,
    color: '#777',
  },
  badgeQtd: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeTexto: {
    color: '#0d47a1',
    fontWeight: 'bold',
    fontSize: 14,
  },
  textoVazio: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontStyle: 'italic',
  },
});