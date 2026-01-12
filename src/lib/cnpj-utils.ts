// Utilitários para validação e formatação de CNPJ

/**
 * Remove caracteres não numéricos do CNPJ
 */
export function limparCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Formata um CNPJ para exibição: XX.XXX.XXX/XXXX-XX
 */
export function formatarCNPJ(cnpj: string): string {
  const limpo = limparCNPJ(cnpj);
  if (limpo.length !== 14) return cnpj;
  
  return limpo.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Valida se um CNPJ é válido matematicamente
 */
export function validarCNPJ(cnpj: string): boolean {
  const limpo = limparCNPJ(cnpj);
  
  // Deve ter 14 dígitos
  if (limpo.length !== 14) return false;
  
  // Não pode ser sequência de dígitos iguais
  if (/^(\d)\1{13}$/.test(limpo)) return false;
  
  // Validação dos dígitos verificadores
  let tamanho = limpo.length - 2;
  let numeros = limpo.substring(0, tamanho);
  const digitos = limpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = limpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
}

/**
 * Interface para dados retornados pela API de consulta de CNPJ
 */
export interface DadosEmpresaCNPJ {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  tipo: string;
  dataAbertura: string;
  naturezaJuridica: string;
  atividadePrincipal: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string;
  telefone: string;
  capitalSocial: number;
}

/**
 * Consulta dados de uma empresa pelo CNPJ usando a API BrasilAPI
 */
export async function consultarCNPJ(cnpj: string): Promise<DadosEmpresaCNPJ | null> {
  const limpo = limparCNPJ(cnpj);
  
  if (!validarCNPJ(limpo)) {
    throw new Error('CNPJ inválido');
  }
  
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${limpo}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CNPJ não encontrado na base da Receita Federal');
      }
      throw new Error('Erro ao consultar CNPJ');
    }
    
    const data = await response.json();
    
    // Formatar endereço
    const enderecoPartes = [
      data.logradouro,
      data.numero,
      data.complemento,
      data.bairro,
      data.municipio,
      data.uf
    ].filter(Boolean);
    
    return {
      cnpj: formatarCNPJ(limpo),
      razaoSocial: data.razao_social || '',
      nomeFantasia: data.nome_fantasia || data.razao_social || '',
      situacao: data.descricao_situacao_cadastral || '',
      tipo: data.descricao_tipo_de_sociedade || '',
      dataAbertura: data.data_inicio_atividade || '',
      naturezaJuridica: data.natureza_juridica || '',
      atividadePrincipal: data.cnae_fiscal_descricao || '',
      logradouro: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      municipio: data.municipio || '',
      uf: data.uf || '',
      cep: data.cep || '',
      email: data.email || '',
      telefone: data.ddd_telefone_1 || '',
      capitalSocial: data.capital_social || 0
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao consultar CNPJ');
  }
}
