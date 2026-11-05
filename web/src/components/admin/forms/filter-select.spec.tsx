import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterMultiSelect, FilterSingleSelect } from './filter-select';

const brands = [
  { value: 'nike-sb', label: 'Nike SB', count: 2 },
  { value: 'stussy', label: 'Stüssy', count: 1 },
];

describe('FilterMultiSelect', () => {
  it('shows "all" with nothing chosen, the label with one and the count with more', () => {
    const { rerender } = render(<FilterMultiSelect label="Marca" allLabel="Todas" options={brands} value={[]} onValueChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Marca: Todas' })).toBeDefined();

    rerender(<FilterMultiSelect label="Marca" allLabel="Todas" options={brands} value={['stussy']} onValueChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Marca: Stüssy' })).toBeDefined();

    rerender(<FilterMultiSelect label="Marca" allLabel="Todas" options={brands} value={['stussy', 'nike-sb']} onValueChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Marca: 2 selecionadas' })).toBeDefined();
  });

  it('searches the options, ignoring accents, and adds the one checked', () => {
    const onValueChange = vi.fn();

    render(
      <FilterMultiSelect
        label="Marca"
        allLabel="Todas"
        options={brands}
        value={['nike-sb']}
        onValueChange={onValueChange}
        searchPlaceholder="Buscar marca"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Marca: Nike SB' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar marca' }), { target: { value: 'stussy' } });

    expect(screen.queryByText('Nike SB', { selector: 'label' })).toBeNull();

    fireEvent.click(screen.getByRole('checkbox'));

    expect(onValueChange).toHaveBeenCalledWith(['nike-sb', 'stussy']);
  });

  it('removes an option when unchecked', () => {
    const onValueChange = vi.fn();

    render(<FilterMultiSelect label="Marca" allLabel="Todas" options={brands} value={['nike-sb']} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Marca: Nike SB' }));
    fireEvent.click(screen.getAllByRole('checkbox')[0] as HTMLElement);

    expect(onValueChange).toHaveBeenCalledWith([]);
  });
});

describe('FilterSingleSelect', () => {
  const statuses = [
    { value: 'todos', label: 'Todos', count: 19 },
    { value: 'ativos', label: 'Ativos', count: 17 },
  ] as const;

  it('picks one option and closes', () => {
    const onValueChange = vi.fn();

    render(<FilterSingleSelect label="Status" options={statuses} value="todos" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Status: Todos' }));
    fireEvent.click(screen.getByRole('radio', { name: /Ativos/ }));

    expect(onValueChange).toHaveBeenCalledWith('ativos');
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });
});
