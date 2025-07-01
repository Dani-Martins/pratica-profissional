using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("movimentacao_nfe")]
    public class MovimentacaoNFE
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("nfe_id")]
        public long NfeId { get; set; }

        [Required]
        [Column("data_movimentacao")]
        public DateTime DataMovimentacao { get; set; }

        [Required]
        [Column("status")]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty;

        [Column("descricao")]
        public string? Descricao { get; set; }

        [ForeignKey("NfeId")]
        public virtual NFE? NFE { get; set; }
    }
}