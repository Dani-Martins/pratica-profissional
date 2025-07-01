using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("cidade")]
    public class Cidade
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("nome")]
        [StringLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Column("codigo_ibge")]
        [StringLength(10)]
        public string? CodigoIBGE { get; set; }

        [Required]
        [Column("estado_id")]
        public long EstadoId { get; set; }

        [Column("situacao")]
        public bool Situacao { get; set; } = true;

        [Column("data_criacao")]
        public DateTime DataCriacao { get; set; } = DateTime.Now;

        [Column("data_atualizacao")]
        public DateTime? DataAtualizacao { get; set; }

        [Column("user_criacao")]
        [StringLength(100)]
        public string? UserCriacao { get; set; }

        [Column("user_atualizacao")]
        [StringLength(100)]
        public string? UserAtualizacao { get; set; }

        [ForeignKey("EstadoId")]
        public virtual Estado? Estado { get; set; }
    }
}
