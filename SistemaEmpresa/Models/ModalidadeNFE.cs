using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("modalidade_nfe")]
    public class ModalidadeNFE
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("codigo")]
        [StringLength(10)]
        public string Codigo { get; set; } = string.Empty;

        [Required]
        [Column("descricao")]
        [StringLength(100)]
        public string Descricao { get; set; } = string.Empty;

        [Column("ativo")]
        public bool Ativo { get; set; } = true;
    }
}