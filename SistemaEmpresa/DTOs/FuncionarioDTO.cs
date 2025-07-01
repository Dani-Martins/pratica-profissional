using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class FuncionarioDTO
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "Tipo de pessoa é obrigatório")]
        public string TipoPessoa { get; set; } = "F"; // Pessoa Física apenas

        [StringLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
        public string? Nome { get; set; }

        [StringLength(60, ErrorMessage = "Apelido deve ter no máximo 60 caracteres")]
        public string? Apelido { get; set; }

        [StringLength(14, ErrorMessage = "CPF deve ter no máximo 14 caracteres")]
        public string? CPF { get; set; }

        [StringLength(20, ErrorMessage = "RG deve ter no máximo 20 caracteres")]
        public string? RG { get; set; }

        [StringLength(25, ErrorMessage = "CNH deve ter no máximo 25 caracteres")]
        public string? CNH { get; set; }

        public DateTime? DataValidadeCNH { get; set; }

        public int? Sexo { get; set; }

        public int? EstadoCivil { get; set; }

        public int IsBrasileiro { get; set; } = 1;

        public int? Nacionalidade { get; set; }

        [StringLength(255, ErrorMessage = "Observações devem ter no máximo 255 caracteres")]
        public string? Observacoes { get; set; }

        public int? FuncaoFuncionarioId { get; set; }

        public FuncaoFuncionarioDTO? FuncaoFuncionario { get; set; }

        public DateTime? DataNascimento { get; set; }

        [EmailAddress(ErrorMessage = "Email inválido")]
        [StringLength(100, ErrorMessage = "Email deve ter no máximo 100 caracteres")]
        public string? Email { get; set; }

        [StringLength(20, ErrorMessage = "Telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }

        [StringLength(100, ErrorMessage = "Endereço deve ter no máximo 100 caracteres")]
        public string? Endereco { get; set; }

        [StringLength(10, ErrorMessage = "Número deve ter no máximo 10 caracteres")]
        public string? Numero { get; set; }

        [StringLength(50, ErrorMessage = "Complemento deve ter no máximo 50 caracteres")]
        public string? Complemento { get; set; }

        [StringLength(50, ErrorMessage = "Bairro deve ter no máximo 50 caracteres")]
        public string? Bairro { get; set; }

        [StringLength(8, MinimumLength = 8, ErrorMessage = "CEP deve ter 8 caracteres")]
        public string? CEP { get; set; }

        public long? CidadeId { get; set; }

        [Required(ErrorMessage = "Data de admissão é obrigatória")]
        public DateTime DataAdmissao { get; set; }

        public DateTime? DataDemissao { get; set; }

        [Range(0, 999999.99, ErrorMessage = "Salário deve estar entre 0 e 999.999,99")]
        public decimal? Salario { get; set; }

        public bool Ativo { get; set; }

        public CidadeDTO? Cidade { get; set; }

        public DateTime DataCriacao { get; set; }
        public DateTime? DataAlteracao { get; set; }
        public string UserCriacao { get; set; } = "SISTEMA";
        public string? UserAtualizacao { get; set; }

        // Propriedades calculadas
        public string? SexoDescricao => 
            Sexo switch
            {
                1 => "Masculino",
                2 => "Feminino",
                3 => "Outro",
                _ => "Não informado"
            };

        public string? EstadoCivilDescricao => 
            EstadoCivil switch
            {
                1 => "Solteiro(a)",
                2 => "Casado(a)",
                3 => "Divorciado(a)",
                4 => "Viúvo(a)",
                5 => "União estável",
                _ => "Não informado"
            };

        public string? NacionalidadeTexto => 
            IsBrasileiro == 1 ? "Brasileiro(a)" : "Estrangeiro(a)";
    }    
    
    public class CreateFuncionarioDTO
    {
        [Required(ErrorMessage = "Tipo de pessoa é obrigatório")]
        [StringLength(1, ErrorMessage = "Tipo de pessoa deve ser 'F'")]
        public string TipoPessoa { get; set; } = "F"; // Apenas Pessoa Física

        [StringLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
        public string? Nome { get; set; }

        [StringLength(60, ErrorMessage = "Apelido deve ter no máximo 60 caracteres")]
        public string? Apelido { get; set; }

        [StringLength(14, ErrorMessage = "CPF deve ter no máximo 14 caracteres")]
        public string? CPF { get; set; }

        [StringLength(20, ErrorMessage = "RG deve ter no máximo 20 caracteres")]
        public string? RG { get; set; }

        [StringLength(25, ErrorMessage = "CNH deve ter no máximo 25 caracteres")]
        public string? CNH { get; set; }

        public DateTime? DataValidadeCNH { get; set; }

        public int? Sexo { get; set; }

        public int? EstadoCivil { get; set; }

        public int IsBrasileiro { get; set; } = 1;

        public int? Nacionalidade { get; set; }

        [StringLength(255, ErrorMessage = "Observações devem ter no máximo 255 caracteres")]
        public string? Observacoes { get; set; }

        public int? FuncaoFuncionarioId { get; set; }

        public DateTime? DataNascimento { get; set; }

        [EmailAddress(ErrorMessage = "Email inválido")]
        [StringLength(100, ErrorMessage = "Email deve ter no máximo 100 caracteres")]
        public string? Email { get; set; }

        [StringLength(20, ErrorMessage = "Telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }

        [StringLength(100, ErrorMessage = "Endereço deve ter no máximo 100 caracteres")]
        public string? Endereco { get; set; }

        [StringLength(10, ErrorMessage = "Número deve ter no máximo 10 caracteres")]
        public string? Numero { get; set; }

        [StringLength(50, ErrorMessage = "Complemento deve ter no máximo 50 caracteres")]
        public string? Complemento { get; set; }

        [StringLength(50, ErrorMessage = "Bairro deve ter no máximo 50 caracteres")]
        public string? Bairro { get; set; }

        [StringLength(8, MinimumLength = 8, ErrorMessage = "CEP deve ter 8 caracteres")]
        public string? CEP { get; set; }

        public long? CidadeId { get; set; }

        [Required(ErrorMessage = "Data de admissão é obrigatória")]
        public DateTime DataAdmissao { get; set; }

        public DateTime? DataDemissao { get; set; }

        [Range(0, 999999.99, ErrorMessage = "Salário deve estar entre 0 e 999.999,99")]
        public decimal? Salario { get; set; }
    }

    public class UpdateFuncionarioDTO : CreateFuncionarioDTO
    {
        public bool Ativo { get; set; }
    }
    
    public class FuncionarioCreateDTO
    {
        public string TipoPessoa { get; set; } = "F";
        public string? Nome { get; set; }
        public string? Apelido { get; set; }
        public string? CPF { get; set; }
        public string? RG { get; set; }
        public string? CNH { get; set; }
        public DateTime? DataValidadeCNH { get; set; }
        public int? Sexo { get; set; }
        public int? EstadoCivil { get; set; }
        public int IsBrasileiro { get; set; } = 1;
        public int? Nacionalidade { get; set; }
        public string? Observacoes { get; set; }
        public int? FuncaoFuncionarioId { get; set; }
        public DateTime? DataNascimento { get; set; }
        public string? Telefone { get; set; }
        public string? Email { get; set; }
        public string? Endereco { get; set; }
        public string? Numero { get; set; }
        public string? Complemento { get; set; }
        public string? Bairro { get; set; }
        public string? CEP { get; set; }
        public long? CidadeId { get; set; }
        public decimal Salario { get; set; }
        public DateTime DataAdmissao { get; set; }
        public DateTime? DataDemissao { get; set; }
        public bool Ativo { get; set; } = true;
    }
    
    public class FuncionarioUpdateDTO
    {
        public string TipoPessoa { get; set; } = "F";
        public string? Nome { get; set; }
        public string? Apelido { get; set; }
        public string? CPF { get; set; }
        public string? RG { get; set; }
        public string? CNH { get; set; }
        public DateTime? DataValidadeCNH { get; set; }
        public int? Sexo { get; set; }
        public int? EstadoCivil { get; set; }
        public int IsBrasileiro { get; set; } = 1;
        public int? Nacionalidade { get; set; }
        public string? Observacoes { get; set; }
        public int? FuncaoFuncionarioId { get; set; }
        public DateTime? DataNascimento { get; set; }
        public string? Telefone { get; set; }
        public string? Email { get; set; }
        public string? Endereco { get; set; }
        public string? Numero { get; set; }
        public string? Complemento { get; set; }
        public string? Bairro { get; set; }
        public string? CEP { get; set; }
        public long? CidadeId { get; set; }
        public decimal? Salario { get; set; }
        public DateTime? DataAdmissao { get; set; }
        public DateTime? DataDemissao { get; set; }
        public bool Ativo { get; set; }
    }
}