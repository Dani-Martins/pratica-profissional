using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaEmpresa.Models
{
    [Table("fatura")]
    public class Fatura
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required(ErrorMessage = "NFE é obrigatória")]
        [Column("nfe_id")]
        public long NfeId { get; set; }

        [Required(ErrorMessage = "Número é obrigatório")]
        [Column("numero")]
        [Range(1, int.MaxValue, ErrorMessage = "Número deve ser maior que zero")]
        public int Numero { get; set; }

        [Required(ErrorMessage = "Valor é obrigatório")]
        [Column("valor", TypeName = "decimal(15,2)")]
        [Range(0.01, 999999999.99, ErrorMessage = "Valor deve estar entre 0,01 e 999.999.999,99")]
        public decimal Valor { get; set; }

        [Required(ErrorMessage = "Data de vencimento é obrigatória")]
        [Column("data_vencimento")]
        public DateTime DataVencimento { get; set; }

        [Column("forma_pagamento_id")]
        public long? FormaPagamentoId { get; set; }

        [ForeignKey("NfeId")]
        public virtual NFE? NFE { get; set; }

        [ForeignKey("FormaPagamentoId")]
        public virtual FormaPagamento? FormaPagamento { get; set; }
    }
}
