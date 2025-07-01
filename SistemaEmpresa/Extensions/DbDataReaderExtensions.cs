using System;
using System.Data.Common;

namespace SistemaEmpresa.Extensions
{
    public static class DbDataReaderExtensions
    {
        /// <summary>
        /// Verifica se uma coluna existe no DataReader
        /// </summary>
        /// <param name="reader">O DbDataReader a ser verificado</param>
        /// <param name="columnName">O nome da coluna que está sendo procurada</param>
        /// <returns>True se a coluna existir, false caso contrário</returns>
        public static bool HasColumn(this DbDataReader reader, string columnName)
        {
            for (int i = 0; i < reader.FieldCount; i++)
            {
                if (reader.GetName(i).Equals(columnName, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            return false;
        }
    }
}
