using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("categoria")]
    public class Categoria
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("categoria")]
        [StringLength(255)]
        public string CategoriaNome { get; set; } = string.Empty;

        [Required]
        [Column("situacao")]
        public DateTime Situacao { get; set; }

        [Required]
        [Column("datacriacao")]
        public DateTime? DataCriacao { get; set; }

        [Required]
        [Column("dataalteracao")]
        public DateTime? DataAlteracao { get; set; }

        [Required]
        [Column("usercriacao")]
        public string UserCriacao { get; set; } = string.Empty;

        [Required]
        [Column("useratualizacao")]
        public string UserAtualizacao { get; set; } = string.Empty;
    }
}
