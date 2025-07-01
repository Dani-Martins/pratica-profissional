using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("parcela")]
    public class Parcela
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required(ErrorMessage = "Condição de Pagamento é obrigatória")]
        [Column("condicao_pagamento_id")]
        public long CondicaoPagamentoId { get; set; }

        [Required(ErrorMessage = "Número da parcela é obrigatório")]
        [Column("numero")]
        [Range(1, 99, ErrorMessage = "Número da parcela deve estar entre 1 e 99")]
        public int Numero { get; set; }

        [Required(ErrorMessage = "Dias é obrigatório")]
        [Column("dias")]
        [Range(0, 999, ErrorMessage = "Dias deve estar entre 0 e 999")]
        public int Dias { get; set; }

        [Required(ErrorMessage = "Percentual é obrigatório")]
        [Column("percentual", TypeName = "decimal(5,2)")]
        [Range(0.01, 100, ErrorMessage = "Percentual deve estar entre 0,01 e 100")]
        public decimal Percentual { get; set; }

        [ForeignKey("CondicaoPagamentoId")]
        public virtual CondicaoPagamento? CondicaoPagamento { get; set; }
    }
}
