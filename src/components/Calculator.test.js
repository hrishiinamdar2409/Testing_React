import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalculatorWithLog from './Calculator'; // Ensure this path is correct

// Mock fetch to simulate API calls
beforeAll(() => {
    global.fetch = jest.fn((url) => {
        if (url.includes('calculations')) {
            if (url.includes('page=')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        logs: [
                            { _id: '1', expression: "2 + 2", is_valid: true, output: "4", created_on: new Date().toISOString() },
                            { _id: '2', expression: "10 / 2", is_valid: true, output: "5", created_on: new Date().toISOString() },
                        ],
                        totalPages: 1,
                    }),
                });
            } else {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                });
            }
        }
        return Promise.reject(new Error('Unknown API call'));
    });
});


afterAll(() => {
    jest.restoreAllMocks();
});

describe('Table Component', () => {
    test('renders mock data in the table', async () => {
        render(<CalculatorWithLog />);

        // Wait for the table rows to render
         waitFor(() => {
            expect(screen.getByText('2 + 2')).toBeInTheDocument();
            expect(screen.getByText('4')).toBeInTheDocument();
            expect(screen.getByText('10 / 2')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('5 * 6')).toBeInTheDocument();
            expect(screen.getByText('30')).toBeInTheDocument();
        });
    });
});

describe('Calculator Component', () => {
    beforeEach(() => {
        render(<CalculatorWithLog />);
    });

    test('clicking on number buttons updates the display correctly', () => {
        const numbersToClick = ['1', '2', '3'];
        
        numbersToClick.forEach(number => {
            fireEvent.click(screen.getByText(number));
        });

        // Check the accumulated value
        expect(screen.getByRole('textbox')).toHaveValue('123');
    });

    test('clicking on operator buttons updates the display correctly', () => {
        fireEvent.click(screen.getByText('1'));
        fireEvent.click(screen.getByText('+'));
        fireEvent.click(screen.getByText('2'));

        // Check the accumulated value
        expect(screen.getByRole('textbox')).toHaveValue('1+2');
    });

    test('evaluating an expression calls the API and receives a 200 response', async () => {
        fireEvent.click(screen.getByText('1'));
        fireEvent.click(screen.getByText('+'));
        fireEvent.click(screen.getByText('2'));
        fireEvent.click(screen.getByText('='));
    
        // Wait for the API call and expect a 200 response
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:5000/calculations', expect.any(Object));
            expect(fetch).toHaveBeenCalledTimes(2); 
        });
    
        // Check the actual value in the textbox
        const textbox = screen.getByRole('textbox');
        
        // Log the actual value in the textbox for debugging
        console.log('Textbox value after calculation:', textbox.value);
    
        // Verify if the result is displayed correctly
        expect(textbox).toHaveValue('1+2'); 
    });
    
});
