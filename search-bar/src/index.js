import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class FilterableProductTable extends React.Component {
  constructor(props){
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.state = {
      products: null,
      searchText: '',
      showInStock: false
    };
  }

  componentDidMount() {
    fetch('http://my-json-server.typicode.com/tb-campbell/products-rest-service/products')
      .then(function(res) {
              if (!res.ok) {
                throw new Error("Not 2xx response");
              } else {
                return res.json();
              }
      })
      .then((data) => {
        this.setState({products: data})
      })
      .catch(console.log);
  }

  handleInputChange(event){
    const target = event.target;
    const value = target.name === 'showInStock' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name] : value
    });
  }

  render() {
    return(
      <div className='filterableProductTable'>
        <SearchBar
          showInStock={this.state.showInStock}
          searchText={this.state.searchText}
          onChange={this.handleInputChange}
        />
        <ProductTable
          products={this.state.products}
          searchText={this.state.searchText}
          showInStock={this.state.showInStock}  
        />
      </div>
    );
  }
}


class SearchBar extends React.Component {
  render() {
    return(
      <div>
        <form> 
          <input
            name='searchText'
            placeholder='Search...'
            type='text'
            value={this.props.searchText}
            onChange={this.props.onChange}
          />
          <p>
            <input
              name='showInStock'
              type='checkbox'
              checked={this.props.showInStock}
              onChange={this.props.onChange}
            />
            Only show products in stock
          </p>
        </form>
      </div>
    );
  }
}

function ProductTable(props){
  if(!props.products){
    return <p>PRODUCT LIST MISSING</p>;
  }
  const productList = props.products.filter(
                        product => (!props.showInStock || product.stocked === true)
                                  && product.name.toUpperCase().includes(props.searchText.toUpperCase()))
  const groupedProductCategories = groupBy(productList, 'category');
  const productCategories = [];
  for(let group in groupedProductCategories){
    productCategories.push(
      <ProductRowCategory
        key={group}
        categoryName={group}
        products={groupedProductCategories[group]}
      />
    );
  }

  return(
    <table>
      <thead>
        <tr key={'header'}>
          <th>Name</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {productCategories}
      </tbody>
    </table>
  );
}

function ProductRowCategory(props){
  const products = [];
  for(let product of props.products){
    products.push(
      <ProductRow
        key={product.name}
        name={product.name}
        price={product.price}
        inStock={product.stocked}
      />
    );
  }
  return(
    [
    <tr key={props.categoryName} className='categoryRow'>
      <td className = 'categoryName' colSpan='2'>{props.categoryName}</td>
    </tr>,
    products
    ]
  )
}

function ProductRow(props){
  return(
      <tr key={props.name} className='productRow'>
        <td className = 'productName'>
          {props.inStock ? props.name :
                          <span style={{color: 'red'}}>
                            {props.name}
                          </span>}
        </td>
        <td className = 'productPrice'>{props.price}</td>
      </tr>
  );
}

function groupBy(array, key){
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    return result;
  }, {});
}

ReactDOM.render(
  <FilterableProductTable />,
  document.getElementById('root')
);