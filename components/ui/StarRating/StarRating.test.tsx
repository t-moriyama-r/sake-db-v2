import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StarRating } from '@/components/ui/StarRating/StarRating';

describe('StarRating（操作可能モード）', () => {
  it('radiogroup として max 個の radio ボタンを描画する', () => {
    render(<StarRating value={3} onChange={() => {}} />);
    expect(screen.getByRole('radiogroup', { name: '評価' })).toBeDefined();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('value 以下の星が aria-checked になる', () => {
    render(<StarRating value={3} onChange={() => {}} />);
    const stars = screen.getAllByRole('radio');
    expect(stars.filter((s) => s.getAttribute('aria-checked') === 'true')).toHaveLength(3);
  });

  it('星をクリックすると onChange にその点数が渡る', () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: '4点' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('max を指定すると星の数が変わる', () => {
    render(<StarRating value={1} max={3} onChange={() => {}} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });
});

describe('StarRating（readonly モード）', () => {
  it('role="img" と点数のラベルを持ち、ボタンを描画しない', () => {
    render(<StarRating value={4} readonly />);
    expect(screen.getByRole('img', { name: '4点' })).toBeDefined();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
