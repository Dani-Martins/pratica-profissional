using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SistemaEmpresa.Models
{
    [Table("funcaofuncionarios")]
    public class FuncaoFuncionario
    {
        [Key]
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [Required(ErrorMessage = "A descrição da função é obrigatória")]
        [StringLength(255, ErrorMessage = "A descrição da função deve ter no máximo 255 caracteres")]
        [Column("funcaofuncionario")]
        public string FuncaoFuncionarioNome { get; set; }

        [Column("requercnh")]
        public bool RequerCNH { get; set; }

        [Column("tipocnhrequerido")]
        [StringLength(5, ErrorMessage = "O tipo de CNH requerido deve ter no máximo 5 caracteres")]
        public string? TipoCNHRequerido { get; set; }

        [Column("cargahoraria")]
        [Range(0, 999.99, ErrorMessage = "A carga horária deve estar entre 0 e 999.99")]
        public decimal CargaHoraria { get; set; }        [StringLength(255, ErrorMessage = "A descrição deve ter no máximo 255 caracteres")]
        [Column("descricao")]
        public string? Descricao { get; set; }

        [StringLength(255, ErrorMessage = "A observação deve ter no máximo 255 caracteres")]
        [Column("observacao")]
        public string? Observacao { get; set; }

        [StringLength(1, ErrorMessage = "A situação deve ter apenas 1 caractere")]
        [Column("situacao")]
        public string Situacao { get; set; } = "A"; // A = Ativo, I = Inativo

        [Column("datacriacao")]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime DataCriacao { get; set; } = DateTime.Now;

        [Column("dataalteracao")]
        public DateTime? DataAlteracao { get; set; } = DateTime.Now;

        [Column("usercriacao")]
        public string? UserCriacao { get; set; }

        [Column("useratualizacao")]
        public string? UserAtualizacao { get; set; }

        [NotMapped]
        public bool Ativo => Situacao == "A";
    }
}
