using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SistemaEmpresa.DTOs
{
    public class FuncaoFuncionarioDTO
    {
        public long Id { get; set; }
        
        [JsonPropertyName("funcaoFuncionarioNome")]
        public string? FuncaoFuncionarioNome { get; set; }
        
        [JsonPropertyName("requerCNH")]
        public bool RequerCNH { get; set; }
        
        [JsonPropertyName("tipoCNHRequerido")]
        public string? TipoCNHRequerido { get; set; }
        
        public decimal CargaHoraria { get; set; }
        public string? Descricao { get; set; }
        public string? Observacao { get; set; }
        public string? Situacao { get; set; }
        public DateTime? DataCriacao { get; set; }
        public DateTime? DataAlteracao { get; set; }
        public string? UserCriacao { get; set; }
        public string? UserAtualizacao { get; set; }
        public bool Ativo => Situacao == "A";
    }

    public class FuncaoFuncionarioCreateDTO
    {
        [Required(ErrorMessage = "O nome da função é obrigatório")]
        [StringLength(255, ErrorMessage = "O nome da função deve ter no máximo 255 caracteres")]
        [JsonPropertyName("funcaoFuncionarioNome")]
        public required string FuncaoFuncionarioNome { get; set; }

        [JsonPropertyName("requerCNH")]
        public bool RequerCNH { get; set; }
        
        [StringLength(5, ErrorMessage = "O tipo de CNH requerido deve ter no máximo 5 caracteres")]
        [JsonPropertyName("tipoCNHRequerido")]
        public string? TipoCNHRequerido { get; set; }

        [Range(0, 999.99, ErrorMessage = "A carga horária deve estar entre 0 e 999.99")]
        [JsonPropertyName("cargaHoraria")]
        public decimal CargaHoraria { get; set; }

        [StringLength(255, ErrorMessage = "A descrição deve ter no máximo 255 caracteres")]
        [JsonPropertyName("descricao")]
        public string? Descricao { get; set; }

        [StringLength(255, ErrorMessage = "A observação deve ter no máximo 255 caracteres")]
        [JsonPropertyName("observacao")]
        public string? Observacao { get; set; }
        
        [StringLength(1, ErrorMessage = "A situação deve ser 'A' para Ativo ou 'I' para Inativo")]
        [RegularExpression("[AI]", ErrorMessage = "A situação deve ser 'A' para Ativo ou 'I' para Inativo")]
        [JsonPropertyName("situacao")]
        public string Situacao { get; set; } = "A";
    }

    public class FuncaoFuncionarioUpdateDTO
    {
        [Required(ErrorMessage = "O nome da função é obrigatório")]
        [StringLength(255, ErrorMessage = "O nome da função deve ter no máximo 255 caracteres")]
        [JsonPropertyName("funcaoFuncionarioNome")]
        public required string FuncaoFuncionarioNome { get; set; }

        [JsonPropertyName("requerCNH")]
        public bool RequerCNH { get; set; }
        
        [StringLength(5, ErrorMessage = "O tipo de CNH requerido deve ter no máximo 5 caracteres")]
        [JsonPropertyName("tipoCNHRequerido")]
        public string? TipoCNHRequerido { get; set; }

        [Range(0, 999.99, ErrorMessage = "A carga horária deve estar entre 0 e 999.99")]
        [JsonPropertyName("cargaHoraria")]
        public decimal CargaHoraria { get; set; }

        [StringLength(255, ErrorMessage = "A descrição deve ter no máximo 255 caracteres")]
        [JsonPropertyName("descricao")]
        public string? Descricao { get; set; }

        [StringLength(255, ErrorMessage = "A observação deve ter no máximo 255 caracteres")]
        [JsonPropertyName("observacao")]
        public string? Observacao { get; set; }
        
        [StringLength(1, ErrorMessage = "A situação deve ser 'A' para Ativo ou 'I' para Inativo")]
        [RegularExpression("[AI]", ErrorMessage = "A situação deve ser 'A' para Ativo ou 'I' para Inativo")]
        [JsonPropertyName("situacao")]
        public string? Situacao { get; set; }
    }
}
