import React, { useState } from 'react';
import { Table, Input, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const DataTable = ({ 
  columns, 
  data,
  onRowClick,
  pagination = true,
  pageSize = 10
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('');
  
  // Lógica de filtro
  const filteredData = data.filter(item => {
    return Object.values(item).some(
      value => value && value.toString().toLowerCase().includes(filter.toLowerCase())
    );
  });
  
  // Lógica de ordenação
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    if (a[sortField] < b[sortField]) 
      return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) 
      return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Lógica de paginação
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = pagination 
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Ícone de ordenação para colunas
  const getSortIcon = (field) => {
    if (sortField !== field) return <FontAwesomeIcon icon={faSort} />;
    return sortDirection === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} />
      : <FontAwesomeIcon icon={faSortDown} />;
  };
  
  return (
    <div>
      <div className="mb-3">
        <Input 
          type="search" 
          placeholder="Filtrar dados..." 
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>
      
      <Table hover responsive striped>
        <thead>
          <tr>
            {columns.map(column => (
              <th 
                key={column.field} 
                onClick={() => column.sortable !== false && handleSort(column.field)}
                style={column.sortable !== false ? { cursor: 'pointer' } : {}}
              >
                {column.header}
                {column.sortable !== false && (
                  <span className="ms-2">
                    {getSortIcon(column.field)}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center">
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            paginatedData.map((item, index) => (
              <tr 
                key={item.id || index}
                onClick={() => onRowClick && onRowClick(item)}
                style={onRowClick ? { cursor: 'pointer' } : {}}
              >
                {columns.map(column => (
                  <td key={column.field}>
                    {column.render ? column.render(item) : item[column.field]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>
      
      {pagination && totalPages > 1 && (
        <Pagination>
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink first onClick={() => setCurrentPage(1)} />
          </PaginationItem>
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink previous onClick={() => setCurrentPage(currentPage - 1)} />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i} active={i + 1 === currentPage}>
              <PaginationLink onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationLink next onClick={() => setCurrentPage(currentPage + 1)} />
          </PaginationItem>
          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationLink last onClick={() => setCurrentPage(totalPages)} />
          </PaginationItem>
        </Pagination>
      )}
    </div>
  );
};

export default DataTable;