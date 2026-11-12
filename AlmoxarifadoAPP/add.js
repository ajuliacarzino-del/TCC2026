import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

const API_URL = 'http://10.154.21.16:5000';

const CATEGORIAS = ['Ferramenta', 'EPI', 'Outros'];
const ESTOQUE_BAIXO = 5; // abaixo disso a quantidade fica destacada

// Dados fictícios iniciais
const ESTOQUE_INICIAL = [
  { id: 1, nome: 'Chave de Fenda', categoria: 'Ferramenta', quantidade: 25 },
  { id: 2, nome: 'Alicate Universal', categoria: 'Ferramenta', quantidade: 18 },
  { id: 3, nome: 'Martelo', categoria: 'Ferramenta', quantidade: 12 },
  { id: 4, nome: 'Furadeira', categoria: 'Ferramenta', quantidade: 6 },
  { id: 5, nome: 'Trena 5m', categoria: 'Ferramenta', quantidade: 15 },
  { id: 6, nome: 'Capacete de Segurança', categoria: 'EPI', quantidade: 30 },
  { id: 7, nome: 'Luvas de Raspa', categoria: 'EPI', quantidade: 40 },
  { id: 8, nome: 'Óculos de Proteção', categoria: 'EPI', quantidade: 22 },
  { id: 9, nome: 'Protetor Auricular', categoria: 'EPI', quantidade: 3 },
  { id: 10, nome: 'Bota de Segurança', categoria: 'EPI', quantidade: 9 },
  { id: 11, nome: 'Colete Refletivo', categoria: 'EPI', quantidade: 14 },
  { id: 12, nome: 'Extintor de Pó ABC', categoria: 'Outros', quantidade: 4 },
];

// Converte o texto digitado em número inteiro positivo (ou null se inválido)
const lerQuantidade = (texto) => {
  const n = parseInt(texto, 10);
  return isNaN(n) || n <= 0 ? null : n;
};

export default function TelaGerenciarItens() {
  const [itens, setItens] = useState(ESTOQUE_INICIAL);
  const [selecionadoId, setSelecionadoId] = useState(null);
  const [qtdMov, setQtdMov] = useState('');

  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('Ferramenta');
  const [novaQtd, setNovaQtd] = useState('');

  const selecionado = itens.find((i) => i.id === selecionadoId) || null;
  const totalUnidades = itens.reduce((soma, i) => soma + i.quantidade, 0);

  // ==========================================
  // AÇÕES
  // ==========================================

  const movimentar = (tipo) => {
    if (!selecionado) {
      Alert.alert('Aviso', 'Toque em um item da tabela para selecioná-lo.');
      return;
    }
    const qtd = lerQuantidade(qtdMov);
    if (qtd === null) {
      Alert.alert('Aviso', 'Informe uma quantidade maior que zero.');
      return;
    }
    if (tipo === 'saida' && qtd > selecionado.quantidade) {
      Alert.alert(
        'Quantidade insuficiente',
        `Há apenas ${selecionado.quantidade} un de "${selecionado.nome}" em estoque.`
      );
      return;
    }

    setItens((lista) =>
      lista.map((i) =>
        i.id === selecionado.id
          ? { ...i, quantidade: i.quantidade + (tipo === 'entrada' ? qtd : -qtd) }
          : i
      )
    );
    setQtdMov('');
  };

  const cadastrarItem = () => {
    const nome = novoNome.trim();
    const qtd = lerQuantidade(novaQtd);

    if (!nome || !novaQtd) {
      Alert.alert('Aviso', 'Preencha o nome do item e a quantidade.');
      return;
    }
    if (qtd === null) {
      Alert.alert('Aviso', 'A quantidade deve ser maior que zero.');
      return;
    }
    if (itens.some((i) => i.nome.toLowerCase() === nome.toLowerCase())) {
      Alert.alert(
        'Item já existe',
        'Já há um item com esse nome. Selecione-o na tabela e use a Entrada (+).'
      );
      return;
    }

    const novoId = itens.length ? Math.max(...itens.map((i) => i.id)) + 1 : 1;
    setItens((lista) => [
      ...lista,
      { id: novoId, nome, categoria: novaCategoria, quantidade: qtd },
    ]);
    setSelecionadoId(novoId);
    setNovoNome('');
    setNovaQtd('');
  };

  const excluirSelecionado = () => {
    if (!selecionado) return;
    Alert.alert(
      'Excluir item',
      `Remover "${selecionado.nome}" da tabela?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setItens((lista) => lista.filter((i) => i.id !== selecionado.id));
            setSelecionadoId(null);
            setQtdMov('');
          },
        },
      ]
    );
  };

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================

  return (
    <View>
      {/* ---------- TABELA ---------- */}
      <View style={styles.card}>
        <Text style={styles.titulo}>Tabela de Itens</Text>
        <Text style={styles.resumo}>
          {itens.length} itens · {totalUnidades} unidades no total
        </Text>

        <View style={styles.linhaCabecalho}>
          <Text style={[styles.cabecalho, styles.colId]}>ID</Text>
          <Text style={[styles.cabecalho, styles.colNome]}>Item</Text>
          <Text style={[styles.cabecalho, styles.colCat]}>Categoria</Text>
          <Text style={[styles.cabecalho, styles.colQtd]}>Qtd</Text>
        </View>

        {itens.length === 0 && (
          <Text style={styles.textoVazio}>
            A tabela está vazia. Cadastre um item abaixo.
          </Text>
        )}

        {itens.map((item, index) => {
          const ativo = item.id === selecionadoId;
          const baixo = item.quantidade < ESTOQUE_BAIXO;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSelecionadoId(ativo ? null : item.id)}
              style={[
                styles.linha,
                index % 2 === 1 && styles.linhaZebra,
                ativo && styles.linhaAtiva,
              ]}
            >
              <Text style={[styles.celula, styles.colId]}>{item.id}</Text>
              <Text style={[styles.celula, styles.colNome, styles.celulaNome]}>
                {item.nome}
              </Text>
              <Text style={[styles.celula, styles.colCat]}>{item.categoria}</Text>
              <Text
                style={[
                  styles.celula,
                  styles.colQtd,
                  styles.celulaQtd,
                  baixo && styles.qtdBaixa,
                ]}
              >
                {item.quantidade}
              </Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.legenda}>
          Quantidade em vermelho = estoque baixo (menos de {ESTOQUE_BAIXO}).
        </Text>
      </View>

      {/* ---------- MOVIMENTAR ITEM SELECIONADO ---------- */}
      <View style={[styles.card, styles.espaco]}>
        <Text style={styles.titulo}>Entrada e Retirada</Text>

        {selecionado ? (
          <View style={styles.selecionadoBox}>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.selecionadoNome}>{selecionado.nome}</Text>
              <Text style={styles.selecionadoInfo}>
                {selecionado.categoria} · {selecionado.quantidade} un em estoque
              </Text>
            </View>
            <TouchableOpacity onPress={excluirSelecionado} style={styles.btnExcluir}>
              <Text style={styles.btnExcluirTexto}>Excluir</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.dica}>
            Toque em uma linha da tabela para escolher o item.
          </Text>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantidade:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={qtdMov}
            onChangeText={setQtdMov}
          />
        </View>

        <View style={styles.linhaBotoes}>
          <TouchableOpacity
            style={[styles.btn, styles.btnEntrada]}
            onPress={() => movimentar('entrada')}
          >
            <Text style={styles.btnTexto}>+ Entrada</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnSaida]}
            onPress={() => movimentar('saida')}
          >
            <Text style={styles.btnTexto}>− Retirada</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- CADASTRAR NOVO ITEM ---------- */}
      <View style={[styles.card, styles.espaco]}>
        <Text style={styles.titulo}>Cadastrar Novo Item</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome do item:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Chave Inglesa"
            placeholderTextColor="#888"
            value={novoNome}
            onChangeText={setNovoNome}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoria:</Text>
          <View style={styles.linhaChips}>
            {CATEGORIAS.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setNovaCategoria(cat)}
                style={[styles.chip, novaCategoria === cat && styles.chipAtivo]}
              >
                <Text
                  style={[styles.chipTexto, novaCategoria === cat && styles.chipTextoAtivo]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantidade inicial:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 10"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={novaQtd}
            onChangeText={setNovaQtd}
          />
        </View>

        <TouchableOpacity style={[styles.btn, styles.btnEntrada]} onPress={cadastrarItem}>
          <Text style={styles.btnTexto}>Adicionar à Tabela</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==========================================
// ESTILOS (mesmo padrão visual do App.js)
// ==========================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  espaco: { marginTop: 16 },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 4,
  },
  resumo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
  },

  // Tabela
  linhaCabecalho: {
    flexDirection: 'row',
    backgroundColor: '#003366',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cabecalho: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  linhaZebra: { backgroundColor: '#f7f9fc' },
  linhaAtiva: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#0056b3',
  },
  celula: { fontSize: 14, color: '#333' },
  celulaNome: { fontWeight: '600' },
  celulaQtd: { fontWeight: 'bold', textAlign: 'right' },
  qtdBaixa: { color: '#cc0000' },
  colId: { width: 30 },
  colNome: { flex: 1, paddingRight: 6 },
  colCat: { width: 80 },
  colQtd: { width: 40, textAlign: 'right' },
  legenda: { fontSize: 12, color: '#888', marginTop: 10 },
  textoVazio: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
    fontStyle: 'italic',
  },

  // Item selecionado
  selecionadoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selecionadoNome: { fontSize: 16, fontWeight: 'bold', color: '#0d47a1' },
  selecionadoInfo: { fontSize: 13, color: '#0d47a1', marginTop: 2 },
  dica: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 16,
    marginTop: 8,
  },
  btnExcluir: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cc0000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnExcluirTexto: { color: '#cc0000', fontWeight: 'bold', fontSize: 12 },

  // Formulários
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  linhaBotoes: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnEntrada: { backgroundColor: '#28a745' },
  btnSaida: { backgroundColor: '#dc3545' },
  btnTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Categorias
  linhaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eef2f7',
  },
  chipAtivo: { backgroundColor: '#0056b3' },
  chipTexto: { color: '#333', fontWeight: '600', fontSize: 14 },
  chipTextoAtivo: { color: '#fff' },
});
