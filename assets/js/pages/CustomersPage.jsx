import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import CustomersAPI from '../services/customersAPI';

const CustomersPage = (props) => {


    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // recuperation des customers
    const fetchCustomers = async () => {
        try {
            const data = await CustomersAPI.findAll();
            setCustomers(data);
            setLoading(false);
        } catch (error) {
            console.log(error.response);       
        }
    };

    // chargment du composant => recherche  customers
    useEffect(() => {
        fetchCustomers();        
         /* CustomersAPI.findAll()
            .then(data => setCustomers(data))
            .catch(error => console.log(error.response)); */
    }, [])

    // gestion de delete client
    const handleDelete = async id => {

        const originalCustomers = [...customers];

        // 1 approche optimiste ( probleme si serveur down )
        setCustomers(customers.filter(customer => customer.id !== id));

        // 1 approche pessimiste ( alors solution avec copie de tableau )
        try {
            await CustomersAPI.delete(id);
        } catch (error) {
            setCustomers(originalCustomers);
        }

        // meme chose qu au dessus
        /* customersAPI.delete(id)
            .then(response => console.log("ok"))
            .catch(error => {
                setCustomers(originalCustomers);
                console.log(error.response);
            }); */
    };

    // gestion de la pagination / switch page
    const handlePageChange = page => setCurrentPage(page);

    // gestion de la recherche
    const handleSearch = ({ currentTarget }) => {
        setSearch(currentTarget.value);
        setCurrentPage(1);
    };

    const itemsPerPage = 8;

    // <filtrage customers recherche
    const filteredCustomers = customers.filter(
        c => c.firstName.toLowerCase().includes(search.toLowerCase()) ||
        c.lastName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
    );

    //pagination donnes
    const paginatedCustomers =  Pagination.getData(
        filteredCustomers, 
        currentPage, 
        itemsPerPage);

    // solution 1 pour recherche dans pagination
    /* const paginatedCustomers = 
    filteredCustomers.length > itemsPerPage 
    ? Pagination.getData(filteredCustomers, currentPage, itemsPerPage)
    : filteredCustomers; */
    
    return (
        <>
            <div className="mb-3 d-flex justify-content-between align-items-center">
                <h1>Liste des clients</h1>
                <Link to="/customers/new" className="btn btn-primary" >Créer un client</Link>
            </div>
            <div className="form-group">
                <input type="text" onChange={handleSearch} value={search} className="form-control" placeholder="Rechercher..." />
            </div>

            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Client</th>
                        <th>Email</th>
                        <th>Entreprise</th>
                        <th>Factures</th>
                        <th>Montant total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedCustomers.map(customer => <tr key={customer.id}>
                        <td>{customer.id}</td>
                        <td>
                            <a href="#">{customer.firstName} {customer.lastName}</a>
                        </td>
                        <td>{customer.email}</td>
                        <td>{customer.company}</td>
                        <td className='text-center'>
                            <span className="badge badge-primary bg-primary">{customer.invoices.length}</span>
                        </td>
                        <td className='text-center'>{customer.totalAmount.toLocaleString()} €</td>
                        <td>
                            <button
                                onClick={() => handleDelete(customer.id)}
                                disabled={customer.invoices.length > 0}
                                className="btn btn-sm btn-danger text-center">Supprimer</button>
                        </td>
                    </tr>)}

                </tbody>
            </table>

            {itemsPerPage <  filteredCustomers.length && (
            <Pagination 
            currentPage={currentPage} 
            itemsPerPage={itemsPerPage} 
            length={filteredCustomers.length} 
            onPageChanged={handlePageChange}/>)}
            
        </>
    );
}

export default CustomersPage;