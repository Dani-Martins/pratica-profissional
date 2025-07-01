using SistemaEmpresa.Models;
using SistemaEmpresa.Repositories;
using SistemaEmpresa.Validations;
using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.Services
{
    public class FornecedorService
    {
        private readonly FornecedorRepository _fornecedorRepository;
        private readonly CidadeRepository _cidadeRepository;

        public FornecedorService(FornecedorRepository fornecedorRepository, CidadeRepository cidadeRepository)
        {
            _fornecedorRepository = fornecedorRepository;
            _cidadeRepository = cidadeRepository;
        }

        public async Task<IEnumerable<Fornecedor>> GetAllAsync()
        {
            return await _fornecedorRepository.ReadAll();
        }

        public async Task<Fornecedor> GetByIdAsync(long id)
        {
            var fornecedor = await _fornecedorRepository.ReadById(id);
            if (fornecedor == null)
                throw new Exception($"Fornecedor não encontrado com o ID: {id}");
            return fornecedor;
        }

        public async Task<IEnumerable<Fornecedor>> GetByNameAsync(string nome)
        {
            return await _fornecedorRepository.ReadByName(nome);
        }

        public async Task<IEnumerable<Fornecedor>> GetByCNPJAsync(string cnpj)
        {
            var fornecedor = await _fornecedorRepository.ReadByCNPJ(cnpj);
            return fornecedor != null ? new List<Fornecedor> { fornecedor } : Enumerable.Empty<Fornecedor>();
        }        public async Task<Fornecedor> SaveAsync(Fornecedor fornecedor)
        {
            Console.WriteLine($"Iniciando SaveAsync para fornecedor. TipoPessoa: {fornecedor.TipoPessoa}, CNPJ: {fornecedor.CNPJ}, CPF: {fornecedor.CPF}");
            
            // Validar campos obrigatórios
            if (string.IsNullOrWhiteSpace(fornecedor.RazaoSocial))
                throw new ValidationException("A razão social é obrigatória");

            // Validar CNPJ (obrigatório para fornecedor pessoa jurídica)
            if (fornecedor.TipoPessoa == "J")
            {
                Console.WriteLine("Validando fornecedor Pessoa Jurídica");
                if (string.IsNullOrWhiteSpace(fornecedor.CNPJ))
                    throw new ValidationException("O CNPJ é obrigatório para pessoa jurídica");

                if (!DocumentoValidator.ValidarCNPJ(fornecedor.CNPJ))
                    throw new ValidationException("CNPJ inválido");
            }            else if (fornecedor.TipoPessoa == "F")
            {
                Console.WriteLine("Validando fornecedor Pessoa Física");
                // Validação para pessoa física
                if (string.IsNullOrWhiteSpace(fornecedor.CPF))
                    throw new ValidationException("O CPF é obrigatório para pessoa física");
                
                if (!string.IsNullOrWhiteSpace(fornecedor.CPF) && !DocumentoValidator.ValidarCPF(fornecedor.CPF))
                    throw new ValidationException("CPF inválido");
                
                // Para pessoa física, definir CNPJ como "ISENTO" sempre
                fornecedor.CNPJ = "ISENTO";
                Console.WriteLine("CNPJ definido como ISENTO para pessoa física");
                  // Garantir que RazaoSocial e NomeFantasia tenham o formato correto para pessoa física
                if (string.IsNullOrWhiteSpace(fornecedor.Nome))
                    throw new ValidationException("O Nome é obrigatório para pessoa física");
                
                // Se RazaoSocial não começar com [PF], adicioná-lo
                if (fornecedor.RazaoSocial == null || !fornecedor.RazaoSocial.StartsWith("[PF]"))
                {
                    fornecedor.RazaoSocial = $"[PF] {fornecedor.Nome}";
                    Console.WriteLine($"RazaoSocial ajustada para: {fornecedor.RazaoSocial}");
                }
                
                // Garantir que NomeFantasia também tenha o formato correto
                fornecedor.NomeFantasia = fornecedor.RazaoSocial;
                
                // Definir InscricaoEstadual como ISENTO para PF
                fornecedor.InscricaoEstadual = "ISENTO";
            }

            // Validar email se fornecido
            if (!string.IsNullOrWhiteSpace(fornecedor.Email) && !DocumentoValidator.ValidarEmail(fornecedor.Email))
                throw new ValidationException("Email inválido");

            // Validar CEP se fornecido
            if (!string.IsNullOrWhiteSpace(fornecedor.CEP) && !DocumentoValidator.ValidarCEP(fornecedor.CEP))
                throw new ValidationException("CEP inválido");

            // Validar cidade se fornecida
            if (fornecedor.CidadeId.HasValue)
            {
                var cidade = await _cidadeRepository.ReadById(fornecedor.CidadeId.Value);
                if (cidade == null)
                    throw new ValidationException($"Cidade não encontrada com o ID: {fornecedor.CidadeId}");
            }

            // Verificar condição de pagamento se fornecida
            if (fornecedor.CondicaoPagamentoId.HasValue)
            {
                // Aqui você pode adicionar a validação da condição de pagamento
                // similar ao que foi feito com cidade
            }            if (fornecedor.Id == 0)
            {
                // Novo fornecedor, definir campos de criação
                fornecedor.DataCriacao = DateTime.Now;
                fornecedor.DataAlteracao = DateTime.Now;
                fornecedor.UserCriacao = "sistema"; // Idealmente, obter do usuário logado
                fornecedor.UserAtualizacao = "sistema"; // Idealmente, obter do usuário logado
                
                Console.WriteLine($"Criando novo fornecedor: TipoPessoa={fornecedor.TipoPessoa}, Nome={fornecedor.Nome}, CPF={fornecedor.CPF}, CNPJ={fornecedor.CNPJ}, RazaoSocial={fornecedor.RazaoSocial}");
                await _fornecedorRepository.Create(fornecedor);
            }
            else
            {
                // Fornecedor existente, obter dados originais
                var fornecedorExistente = await _fornecedorRepository.ReadById(fornecedor.Id);
                  // Manter data de criação original
                fornecedor.DataCriacao = fornecedorExistente?.DataCriacao ?? DateTime.Now;
                fornecedor.UserCriacao = fornecedorExistente?.UserCriacao ?? "sistema";
                
                // Atualizar campos de alteração
                fornecedor.DataAlteracao = DateTime.Now;
                fornecedor.UserAtualizacao = "sistema"; // Idealmente, obter do usuário logado
                
                Console.WriteLine($"Atualizando fornecedor: ID={fornecedor.Id}, TipoPessoa={fornecedor.TipoPessoa}, Nome={fornecedor.Nome}, CPF={fornecedor.CPF}, CNPJ={fornecedor.CNPJ}, RazaoSocial={fornecedor.RazaoSocial}");
                await _fornecedorRepository.Update(fornecedor.Id, fornecedor);
            }
            return fornecedor;
        }

        public async Task DeleteAsync(long id)
        {
            var fornecedor = await _fornecedorRepository.ReadById(id);
            if (fornecedor == null)
                throw new Exception($"Fornecedor não encontrado com o ID: {id}");

            Console.WriteLine($"Inativando fornecedor ID: {id}");
            
            // Vamos apenas inativar o fornecedor, não excluir fisicamente
            await _fornecedorRepository.Delete(id);
            
            Console.WriteLine($"Fornecedor ID: {id} inativado com sucesso");
        }
    }
}