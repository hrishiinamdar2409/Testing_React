
import React, { useState, useEffect, useMemo } from 'react';
import './Calculator.css'; // Ensure this file has the updated styles
import SearchSharpIcon from '@mui/icons-material/SearchSharp';
import DeleteIcon from '@mui/icons-material/Delete';

const CalculatorWithLog = () => {
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState({});
    const [searchID, setSearchID] = useState('');
    const [searchExpression, setSearchExpression] = useState('');
    const [searchIsValid, setSearchIsValid] = useState('');
    const [searchOutput, setSearchOutput] = useState('');
    const [searchCreatedOn, setSearchCreatedOn] = useState('');
    const [searchVisible, setSearchVisible] = useState({
        id: false,
        expression: false,
        isValid: false,
        output: false,
        createdOn: false
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(`http://localhost:5000/calculations?page=${page}`);
                const data = await response.json();
                setLogs(data.logs);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error('Failed to fetch logs:', error);
            }
        };

        fetchLogs();
    }, [page]);

    const handleClick = (value) => {
        setInput((prevInput) => prevInput + value);
    };

    const clearInput = () => {
        setInput('');
    };

    const deleteLast = () => {
        setInput((prevInput) => prevInput.slice(0, -1));
    };

    // const calculateResult = async () => {
    //     try {
    //         const result = eval(input); // Caution: eval can be dangerous, consider using a safer alternative
    //         const logEntry = {
    //             expression: input,
    //             is_valid: true,
    //             output: result.toString()
    //         };

    //         await fetch('http://localhost:5000/calculations', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(logEntry),
    //         });

    //         const response = await fetch(`http://localhost:5000/calculations?page=${page}`);
    //         const data = await response.json();
    //         setLogs(data.logs);
    //         setTotalPages(data.totalPages);

    //         setInput(result.toString());
    //         setSelectedLogs((prev) => ({
    //             ...prev,
    //             [data.logs.length]: false
    //         }));
    //     } catch (error) {
    //         const logEntry = {
    //             expression: input,
    //             is_valid: false,
    //             output: 'error'
    //         };

    //         await fetch('http://localhost:5000/calculations', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(logEntry),
    //         });

    //         const response = await fetch(`http://localhost:5000/calculations?page=${page}`);
    //         const data = await response.json();
    //         setLogs(data.logs);
    //         setTotalPages(data.totalPages);

    //         setInput('error');
    //         setSelectedLogs((prev) => ({
    //             ...prev,
    //             [data.logs.length]: false
    //         }));
    //     }
    // };

    const calculateResult = async () => {
        try {
            const result = eval(input); // Be cautious with eval
            const logEntry = {
                expression: input,
                is_valid: true,
                output: result.toString()
            };
    
            const postResponse = await fetch('http://localhost:5000/calculations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry),
            });
    
            // Check if the POST request was successful
            if (!postResponse.ok) {
                throw new Error('Failed to post calculation');
            }
    
            const response = await fetch(`http://localhost:5000/calculations?page=${page}`);
            
            // Check if the GET request was successful
            if (!response.ok) {
                throw new Error('Failed to fetch logs');
            }
    
            const data = await response.json();
            setLogs(data.logs);
            setTotalPages(data.totalPages);
    
            setInput(result.toString());
        } catch (error) {
            const logEntry = {
                expression: input,
                is_valid: false,
                output: 'error'
            };
    
            await fetch('http://localhost:5000/calculations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry),
            });
    
            // Handle error fetching logs
            console.error('Error:', error);
            setInput('error');
        }
    };
    

    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        setSelectAll(isChecked);
        setSelectedLogs((prev) => {
            const newSelectedLogs = {};
            logs.forEach(log => {
                newSelectedLogs[log._id] = isChecked;
            });
            return newSelectedLogs;
        });
    };

    const handleRowCheckboxChange = (event, id) => {
        const isChecked = event.target.checked;
        setSelectedLogs(prev => ({
            ...prev,
            [id]: isChecked
        }));
    };

    const handleSearchIconClick = (field) => {
        setSearchVisible(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const deleteSelectedLogs = async () => {
        const idsToDelete = Object.keys(selectedLogs).filter(id => selectedLogs[id]);
        if (idsToDelete.length === 0) return;

        try {
            await fetch('http://localhost:5000/calculations', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: idsToDelete }),
            });
            const response = await fetch(`http://localhost:5000/calculations?page=${page}`);
            const data = await response.json();
            setLogs(data.logs);
            setTotalPages(data.totalPages);
            setSelectedLogs({});
        } catch (error) {
            console.error('Failed to delete logs:', error);
        }
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const idMatch = log.id && log.id.toString().toLowerCase().includes(searchID.toLowerCase());
            const expressionMatch = log.expression && log.expression.toLowerCase().includes(searchExpression.toLowerCase());
            const isValidMatch = searchIsValid === '' || (log.is_valid ? 'true' : 'false').includes(searchIsValid.toLowerCase());
            const outputMatch = log.output ? log.output.toString().toLowerCase().includes(searchOutput.toLowerCase()) : '';
            const createdOnMatch = log.created_on ? new Date(log.created_on).toLocaleString().toLowerCase().includes(searchCreatedOn.toLowerCase()) : '';
    
            return idMatch && expressionMatch && isValidMatch && outputMatch && createdOnMatch;
        });
    }, [logs, searchID, searchExpression, searchIsValid, searchOutput, searchCreatedOn]);
    
    return (
        <div className="calculator-log-container">
            <div className="calculator">
                <div className="display">
                    <input type="text" value={input} readOnly />
                </div>
                <div className="button">
                    <button onClick={clearInput}>AC</button>
                    <button onClick={deleteLast}>DEL</button>
                    <button onClick={() => handleClick('%')}>%</button>
                    <button onClick={() => handleClick('/')}>/</button>
                    <button onClick={() => handleClick('7')}>7</button>
                    <button onClick={() => handleClick('8')}>8</button>
                    <button onClick={() => handleClick('9')}>9</button>
                    <button onClick={() => handleClick('*')}>*</button>
                    <button onClick={() => handleClick('4')}>4</button>
                    <button onClick={() => handleClick('5')}>5</button>
                    <button onClick={() => handleClick('6')}>6</button>
                    <button onClick={() => handleClick('-')}>-</button>
                    <button onClick={() => handleClick('1')}>1</button>
                    <button onClick={() => handleClick('2')}>2</button>
                    <button onClick={() => handleClick('3')}>3</button>
                    <button onClick={() => handleClick('+')}>+</button>
                    <button onClick={() => handleClick('00')}>00</button>
                    <button onClick={() => handleClick('0')}>0</button>
                    <button onClick={() => handleClick('.')}>.</button>
                    <button className="eg" onClick={calculateResult}>=</button>
                </div>
            </div>
            <div className="log-table-container">
                <button className="delete-button" onClick={deleteSelectedLogs} disabled={Object.values(selectedLogs).every(val => !val)}>
                    <DeleteIcon /> Delete Selected
                </button>
                <table className="log-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>
                                ID
                                <SearchSharpIcon onClick={() => handleSearchIconClick('id')} />
                                {searchVisible.id && (
                                    <input
                                        type="text"
                                        placeholder="Search ID..."
                                        value={searchID}
                                        onChange={(e) => setSearchID(e.target.value)}
                                    />
                                )}
                            </th>
                            <th>
                                Expression
                                <SearchSharpIcon onClick={() => handleSearchIconClick('expression')} />
                                {searchVisible.expression && (
                                    <input
                                        type="text"
                                        placeholder="Search Expression..."
                                        value={searchExpression}
                                        onChange={(e) => setSearchExpression(e.target.value)}
                                    />
                                )}
                            </th>
                            <th>
                                Is Valid
                                <SearchSharpIcon onClick={() => handleSearchIconClick('isValid')} />
                                {searchVisible.isValid && (
                                    <input
                                        type="text"
                                        placeholder="Search Is Valid..."
                                        value={searchIsValid}
                                        onChange={(e) => setSearchIsValid(e.target.value)}
                                    />
                                )}
                            </th>
                            <th>
                                Output
                                <SearchSharpIcon onClick={() => handleSearchIconClick('output')} />
                                {searchVisible.output && (
                                    <input
                                        type="text"
                                        placeholder="Search Output..."
                                        value={searchOutput}
                                        onChange={(e) => setSearchOutput(e.target.value)}
                                    />
                                )}
                            </th>
                            <th>
                                Created On
                                <SearchSharpIcon onClick={() => handleSearchIconClick('createdOn')} />
                                {searchVisible.createdOn && (
                                    <input
                                        type="text"
                                        placeholder="Search Created On..."
                                        value={searchCreatedOn}
                                        onChange={(e) => setSearchCreatedOn(e.target.value)}
                                    />
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log._id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedLogs[log._id]}
                                        onChange={(event) => handleRowCheckboxChange(event, log._id)}
                                    />
                                </td>
                                <td>{log.id}</td>
                                <td>{log.expression}</td>
                                <td>{log.is_valid ? 'Yes' : 'No'}</td>
                                <td>{log.output}</td>
                                <td>{new Date(log.created_on).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(prevPage => Math.max(prevPage - 1, 1))}
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(prevPage => Math.min(prevPage + 1, totalPages))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalculatorWithLog;

