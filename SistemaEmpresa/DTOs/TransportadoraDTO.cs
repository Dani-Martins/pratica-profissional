using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class TransportadoraDTO
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "Razão Social é obrigatória")]
        [StringLength(100, ErrorMessage = "Razão Social deve ter no máximo 100 caracteres")]
        public string RazaoSocial { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "Nome Fantasia deve ter no máximo 100 caracteres")]
        public string? NomeFantasia { get; set; }

        [Required(ErrorMessage = "CNPJ é obrigatório")]
        [StringLength(14, MinimumLength = 14, ErrorMessage = "CNPJ deve ter 14 caracteres")]
        public string CNPJ { get; set; } = string.Empty;

        [StringLength(20, ErrorMessage = "Inscrição Estadual deve ter no máximo 20 caracteres")]
        public string? InscricaoEstadual { get; set; }

        [StringLength(20, ErrorMessage = "Inscrição Municipal deve ter no máximo 20 caracteres")]
        public string? InscricaoMunicipal { get; set; }

        [StringLength(100, ErrorMessage = "Endereço deve ter no máximo 100 caracteres")]
        public string? Endereco { get; set; }

        [StringLength(10, ErrorMessage = "Número deve ter no máximo 10 caracteres")]
        public string? Numero { get; set; }

        [StringLength(50, ErrorMessage = "Complemento deve ter no máximo 50 caracteres")]
        public string? Complemento { get; set; }

        [StringLength(50, ErrorMessage = "Bairro deve ter no máximo 50 caracteres")]
        public string? Bairro { get; set; }

        public long? CidadeId { get; set; }

        [StringLength(8, MinimumLength = 8, ErrorMessage = "CEP deve ter 8 caracteres")]
        public string? CEP { get; set; }

        [StringLength(20, ErrorMessage = "Telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }

        [EmailAddress(ErrorMessage = "Email inválido")]
        [StringLength(100, ErrorMessage = "Email deve ter no máximo 100 caracteres")]
        public string? Email { get; set; }

        public bool Ativo { get; set; }
        
        public CidadeDTO? Cidade { get; set; }
    }

    public class CreateTransportadoraDTO
    {
        [Required(ErrorMessage = "Razão Social é obrigatória")]
        [StringLength(100, ErrorMessage = "Razão Social deve ter no máximo 100 caracteres")]
        public string RazaoSocial { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "Nome Fantasia deve ter no máximo 100 caracteres")]
        public string? NomeFantasia { get; set; }

        [Required(ErrorMessage = "CNPJ é obrigatório")]
        [StringLength(14, MinimumLength = 14, ErrorMessage = "CNPJ deve ter 14 caracteres")]
        public string CNPJ { get; set; } = string.Empty;

        [StringLength(20, ErrorMessage = "Inscrição Estadual deve ter no máximo 20 caracteres")]
        public string? InscricaoEstadual { get; set; }

        [StringLength(20, ErrorMessage = "Inscrição Municipal deve ter no máximo 20 caracteres")]
        public string? InscricaoMunicipal { get; set; }

        [StringLength(100, ErrorMessage = "Endereço deve ter no máximo 100 caracteres")]
        public string? Endereco { get; set; }

        [StringLength(10, ErrorMessage = "Número deve ter no máximo 10 caracteres")]
        public string? Numero { get; set; }

        [StringLength(50, ErrorMessage = "Complemento deve ter no máximo 50 caracteres")]
        public string? Complemento { get; set; }

        [StringLength(50, ErrorMessage = "Bairro deve ter no máximo 50 caracteres")]
        public string? Bairro { get; set; }

        public long? CidadeId { get; set; }

        [StringLength(8, MinimumLength = 8, ErrorMessage = "CEP deve ter 8 caracteres")]
        public string? CEP { get; set; }

        [StringLength(20, ErrorMessage = "Telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }

        [EmailAddress(ErrorMessage = "Email inválido")]
        [StringLength(100, ErrorMessage = "Email deve ter no máximo 100 caracteres")]
        public string? Email { get; set; }
    }

    public class UpdateTransportadoraDTO : CreateTransportadoraDTO
    {
        public bool Ativo { get; set; }
    }

    public class TransportadoraCreateDTO
    {
        [Required]
        public string RazaoSocial { get; set; } = string.Empty;
        public string? NomeFantasia { get; set; }
        [Required]
        public string CNPJ { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? Endereco { get; set; }
        public long? CidadeId { get; set; }
        public bool Ativo { get; set; } = true;
        public string Numero { get; set; } = string.Empty;
        public string? Complemento { get; set; }
        public string Bairro { get; set; } = string.Empty;
        public string Cep { get; set; } = string.Empty;
    }
}

// Classe auxiliar para o relacionamento com Cidade
public class CidadeDTO
{
    public long Id { get; set; }
    public string Nome { get; set; } = string.Empty;
}