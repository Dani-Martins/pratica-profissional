using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{    public class FornecedorDTO
    {
        public long Id { get; set; }
        public string? TipoPessoa { get; set; }
        public string? Nome { get; set; }
        public string? CPF { get; set; }
        public string? RazaoSocial { get; set; }
        public string? NomeFantasia { get; set; }
        public string? CNPJ { get; set; }
        public string? InscricaoEstadual { get; set; }
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? Endereco { get; set; }
        public string? Numero { get; set; }
        public string? Complemento { get; set; }
        public string? Bairro { get; set; }
        public string? CEP { get; set; }
        public long? CidadeId { get; set; }
        public CidadeDTO? Cidade { get; set; }
        public bool Ativo { get; set; }
        
        // Novos campos
        public string? Apelido { get; set; }
        public decimal? LimiteCredito { get; set; }
        public string? RG { get; set; }
        public string? Contato { get; set; }
        public long? CondicaoPagamentoId { get; set; }
        public CondicaoPagamentoDTO? CondicaoPagamento { get; set; }
        public string? Observacao { get; set; }
        public DateTime? DataCriacao { get; set; }
        public DateTime? DataAlteracao { get; set; }
        public string? UserCriacao { get; set; }
        public string? UserAtualizacao { get; set; }
    }public class FornecedorCreateDTO
    {
        [Required(ErrorMessage = "O tipo de pessoa é obrigatório")]
        [StringLength(1, ErrorMessage = "Tipo de pessoa deve ser F ou J")]
        public required string TipoPessoa { get; set; } = "J";

        [StringLength(100, ErrorMessage = "O nome deve ter no máximo 100 caracteres")]
        public string? Nome { get; set; }

        [StringLength(14, ErrorMessage = "O CPF deve ter no máximo 14 caracteres")]
        public string? CPF { get; set; }

        [StringLength(150, ErrorMessage = "A razão social deve ter no máximo 150 caracteres")]
        public string? RazaoSocial { get; set; }

        [StringLength(100, ErrorMessage = "O nome fantasia deve ter no máximo 100 caracteres")]
        public string? NomeFantasia { get; set; }

        [StringLength(18, ErrorMessage = "O CNPJ deve ter no máximo 18 caracteres")]
        public string? CNPJ { get; set; }

        [StringLength(20, ErrorMessage = "A inscrição estadual deve ter no máximo 20 caracteres")]
        public string? InscricaoEstadual { get; set; }

        [EmailAddress(ErrorMessage = "Formato de e-mail inválido")]
        [StringLength(100, ErrorMessage = "O email deve ter no máximo 100 caracteres")]
        public string? Email { get; set; }

        [StringLength(20, ErrorMessage = "O telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }

        [StringLength(200, ErrorMessage = "O endereço deve ter no máximo 200 caracteres")]
        public string? Endereco { get; set; }

        [StringLength(20, ErrorMessage = "O número deve ter no máximo 20 caracteres")]
        public string? Numero { get; set; }

        [StringLength(100, ErrorMessage = "O complemento deve ter no máximo 100 caracteres")]
        public string? Complemento { get; set; }

        [StringLength(50, ErrorMessage = "O bairro deve ter no máximo 50 caracteres")]
        public string? Bairro { get; set; }

        [StringLength(10, ErrorMessage = "O CEP deve ter no máximo 10 caracteres")]
        public string? CEP { get; set; }

        public long? CidadeId { get; set; }

        public bool Ativo { get; set; } = true;
        
        // Novos campos
        [StringLength(60, ErrorMessage = "O apelido deve ter no máximo 60 caracteres")]
        public string? Apelido { get; set; }
        
        public decimal? LimiteCredito { get; set; }
        
        [StringLength(14, ErrorMessage = "O RG deve ter no máximo 14 caracteres")]
        public string? RG { get; set; }
        
        [StringLength(255, ErrorMessage = "O Contato deve ter no máximo 255 caracteres")]
        public string? Contato { get; set; }
        
        public long? CondicaoPagamentoId { get; set; }
        
        [StringLength(255, ErrorMessage = "A observação deve ter no máximo 255 caracteres")]
        public string? Observacao { get; set; }
    }    public class FornecedorUpdateDTO
    {
        [Required(ErrorMessage = "O tipo de pessoa é obrigatório")]
        [StringLength(1, ErrorMessage = "Tipo de pessoa deve ser F ou J")]
        public required string TipoPessoa { get; set; }

        [StringLength(100, ErrorMessage = "O nome deve ter no máximo 100 caracteres")]
        public string? Nome { get; set; }

        [StringLength(14, ErrorMessage = "O CPF deve ter no máximo 14 caracteres")]
        public string? CPF { get; set; }

        [StringLength(150, ErrorMessage = "A razão social deve ter no máximo 150 caracteres")]
        public string? RazaoSocial { get; set; }

        [StringLength(100, ErrorMessage = "O nome fantasia deve ter no máximo 100 caracteres")]
        public string? NomeFantasia { get; set; }

        [StringLength(18, ErrorMessage = "O CNPJ deve ter no máximo 18 caracteres")]
        public string? CNPJ { get; set; }

        [StringLength(20, ErrorMessage = "A inscrição estadual deve ter no máximo 20 caracteres")]
        public string? InscricaoEstadual { get; set; }

        [EmailAddress(ErrorMessage = "Formato de e-mail inválido")]
        [StringLength(100, ErrorMessage = "O email deve ter no máximo 100 caracteres")]
        public string? Email { get; set; }

        [StringLength(20, ErrorMessage = "O telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }

        [StringLength(200, ErrorMessage = "O endereço deve ter no máximo 200 caracteres")]
        public string? Endereco { get; set; }

        [StringLength(20, ErrorMessage = "O número deve ter no máximo 20 caracteres")]
        public string? Numero { get; set; }

        [StringLength(100, ErrorMessage = "O complemento deve ter no máximo 100 caracteres")]
        public string? Complemento { get; set; }

        [StringLength(50, ErrorMessage = "O bairro deve ter no máximo 50 caracteres")]
        public string? Bairro { get; set; }

        [StringLength(10, ErrorMessage = "O CEP deve ter no máximo 10 caracteres")]
        public string? CEP { get; set; }        
        
        public long? CidadeId { get; set; }

        public bool Ativo { get; set; }
        
        // Novos campos
        [StringLength(60, ErrorMessage = "O apelido deve ter no máximo 60 caracteres")]
        public string? Apelido { get; set; }
        
        public decimal? LimiteCredito { get; set; }
        
        [StringLength(14, ErrorMessage = "O RG deve ter no máximo 14 caracteres")]
        public string? RG { get; set; }
        
        [StringLength(255, ErrorMessage = "O Contato deve ter no máximo 255 caracteres")]
        public string? Contato { get; set; }
        
        public long? CondicaoPagamentoId { get; set; }
        
        [StringLength(255, ErrorMessage = "A observação deve ter no máximo 255 caracteres")]
        public string? Observacao { get; set; }
    }
}