using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SistemaEmpresa.Models
{
    [Table("funcionario")]
    public class Funcionario
    {
        [Key]
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [Column("tipopessoa")]
        [StringLength(1)]
        [Obsolete("O tipo de pessoa não é mais utilizado. Todos os funcionários são considerados pessoa física (F).")]
        public string? TipoPessoa { get; set; } = "F"; // Sempre Física

        [Required(ErrorMessage = "O nome do funcionário é obrigatório")]
        [StringLength(100, ErrorMessage = "O nome deve ter no máximo 100 caracteres")]
        [Column("nome")]
        public string Nome { get; set; } = string.Empty;

        [StringLength(60, ErrorMessage = "O apelido deve ter no máximo 60 caracteres")]
        [Column("apelido")]
        public string? Apelido { get; set; }

        [StringLength(14, ErrorMessage = "O CPF deve ter no máximo 14 caracteres")]
        [Column("cpf")]
        public string? CPF { get; set; }

        [StringLength(20, ErrorMessage = "O RG deve ter no máximo 20 caracteres")]
        [Column("rg")]
        public string? RG { get; set; }

        [StringLength(25, ErrorMessage = "A CNH deve ter no máximo 25 caracteres")]
        [Column("cnh")]
        public string? CNH { get; set; }

        [Column("datavalidadecnh")]
        [DataType(DataType.Date)]
        public DateTime? DataValidadeCNH { get; set; }

        [Column("sexo")]
        public int? Sexo { get; set; } // 1 = Masculino, 2 = Feminino, 3 = Outro

        [Column("estadocivil")]
        public int? EstadoCivil { get; set; } // 1 = Solteiro, 2 = Casado, 3 = Divorciado, 4 = Viúvo, 5 = União estável

        [Column("isbrasileiro")]
        public int IsBrasileiro { get; set; } = 1; // 1 = Sim, 0 = Não

        [Column("nacionalidade")]
        public int? Nacionalidade { get; set; } // Código do país de nacionalidade

        [Column("observacoes")]
        [StringLength(255, ErrorMessage = "As observações devem ter no máximo 255 caracteres")]
        public string? Observacoes { get; set; }

        [Column("funcaofuncionarioid")]
        public int? FuncaoFuncionarioId { get; set; }

        [ForeignKey("FuncaoFuncionarioId")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public virtual FuncaoFuncionario? FuncaoFuncionario { get; set; }

        [Column("data_nascimento")]
        [DataType(DataType.Date)]
        public DateTime? DataNascimento { get; set; }

        [StringLength(20, ErrorMessage = "O telefone deve ter no máximo 20 caracteres")]
        [Column("telefone")]
        public string? Telefone { get; set; }

        [StringLength(100, ErrorMessage = "O email deve ter no máximo 100 caracteres")]
        [EmailAddress(ErrorMessage = "Formato de e-mail inválido")]
        [Column("email")]
        public string? Email { get; set; }

        [StringLength(200, ErrorMessage = "O endereço deve ter no máximo 200 caracteres")]
        [Column("endereco")]
        public string? Endereco { get; set; }

        [StringLength(20, ErrorMessage = "O número deve ter no máximo 20 caracteres")]
        [Column("numero")]
        public string? Numero { get; set; }

        [StringLength(100, ErrorMessage = "O complemento deve ter no máximo 100 caracteres")]
        [Column("complemento")]
        public string? Complemento { get; set; }

        [StringLength(50, ErrorMessage = "O bairro deve ter no máximo 50 caracteres")]
        [Column("bairro")]
        public string? Bairro { get; set; }

        [StringLength(10, ErrorMessage = "O CEP deve ter no máximo 10 caracteres")]
        [Column("cep")]
        public string? CEP { get; set; }

        [Column("cidade_id")]
        public long? CidadeId { get; set; }

        [Column("data_admissao")]
        [DataType(DataType.Date)]
        public DateTime? DataAdmissao { get; set; }

        [Column("data_demissao")]
        [DataType(DataType.Date)]
        public DateTime? DataDemissao { get; set; }

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        [Column("salario", TypeName = "decimal(10,2)")]
        [Range(0, 999999.99, ErrorMessage = "Salário deve estar entre 0 e 999.999,99")]
        public decimal? Salario { get; set; }

        [Column("datacriacao")]
        public DateTime DataCriacao { get; set; } = DateTime.Now;

        [Column("dataalteracao")]
        public DateTime? DataAlteracao { get; set; }

        [Column("usercriacao")]
        [StringLength(50, ErrorMessage = "O usuário de criação deve ter no máximo 50 caracteres")]
        public string UserCriacao { get; set; } = "SISTEMA";

        [Column("useratualizacao")]
        [StringLength(50, ErrorMessage = "O usuário de atualização deve ter no máximo 50 caracteres")]
        public string? UserAtualizacao { get; set; }

        [ForeignKey("CidadeId")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public virtual Cidade? Cidade { get; set; }

        [NotMapped]
        public int? Idade
        {
            get
            {
                if (!DataNascimento.HasValue)
                    return null;

                var hoje = DateTime.Today;
                var idade = hoje.Year - DataNascimento.Value.Year;
                
                if (DataNascimento.Value.Date > hoje.AddYears(-idade))
                    idade--;
                
                return idade;
            }
        }

        [NotMapped]
        public string TempoServico
        {
            get
            {
                if (!DataAdmissao.HasValue)
                    return "Não admitido";

                var dataFinal = DataDemissao ?? DateTime.Today;
                var meses = ((dataFinal.Year - DataAdmissao.Value.Year) * 12) + 
                           dataFinal.Month - DataAdmissao.Value.Month;
                
                var anos = meses / 12;
                var mesesRestantes = meses % 12;
                
                return $"{anos} ano(s) e {mesesRestantes} mês(es)";
            }
        }

        [NotMapped]
        public bool CPFValido => 
            !string.IsNullOrWhiteSpace(CPF) && 
            System.Text.RegularExpressions.Regex.IsMatch(CPF, @"^\d{3}\.\d{3}\.\d{3}-\d{2}$");

        [NotMapped]
        public string EnderecoCompleto => 
            $"{Endereco ?? ""}, {Numero ?? ""} {(string.IsNullOrEmpty(Complemento) ? "" : $"- {Complemento}")}, {Bairro ?? ""}, {(Cidade != null ? Cidade.Nome : "")}, {(Cidade?.Estado != null ? Cidade.Estado.UF : "")}";
        
        [NotMapped]
        public string SexoDescricao =>
            Sexo switch
            {
                1 => "Masculino",
                2 => "Feminino",
                3 => "Outro",
                _ => "Não informado"
            };

        [NotMapped]
        public string EstadoCivilDescricao =>
            EstadoCivil switch
            {
                1 => "Solteiro(a)",
                2 => "Casado(a)",
                3 => "Divorciado(a)",
                4 => "Viúvo(a)",
                5 => "União estável",
                _ => "Não informado"
            };

        [NotMapped]
        public string NacionalidadeTexto =>
            IsBrasileiro == 1 ? "Brasileiro(a)" : "Estrangeiro(a)";
    }
}
