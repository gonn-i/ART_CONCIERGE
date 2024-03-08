window.onload = function() {
    loadData();
    initDatePicker();        
};

// 달력 초기화
function initDatePicker() {
    flatpickr("#datePicker", {
      mode: "range",
      dateFormat: "Y-m-d",
      onChange: function(selectedDates, dateStr, instance) {
        let startDate = selectedDates[0].toISOString().split('T')[0];
        let endDate = selectedDates[1] ? selectedDates[1].toISOString().split('T')[0] : "";
        let selectedRange = startDate + " ~ " + endDate;

        let input_DatePicker = document.getElementById('datePicker')
        input_DatePicker.textContent = selectedRange;
      }
    });
}

// 카테고리 데이터 불러오기
function loadData() {
    // 카테고리 데이터 Read
    axios.get('/api/admin/categories')
      .then(response => {
      let category_All = response.data;

      let element_Select = document.getElementById('category_Select');
      element_Select.innerHTML = "";

      category_All.forEach(category_One => {
        let optionElement = document.createElement("option");
        optionElement.value = category_One._id;
        optionElement.textContent = category_One.category;
        element_Select.appendChild(optionElement);
      });
    })
    .catch(error => {
          console.error('에러 발생:', error);
    });

    // 쿼리 스트링으로 productId 가져오기
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    
    let product_Id = urlParams.get('productId');
    // 상품 데이터 가져오기(selectOne)
    axios.get(`/api/exhibits/detail/${product_Id}`)
      .then(response => {
        let product_One = response.data;
        document.getElementById('input_ExhibitName').value = product_One.exhibitName;
        document.getElementById('input_Author').value = product_One.author;
        document.getElementById('input_ExhibitPlace').value = product_One.exhibitAddress;
        document.getElementById('input_Price').value = product_One.price;
        document.getElementById('input_Description').value = product_One.information;
        document.getElementById('datePicker').value = product_One.startDate + ' to ' + product_One.endDate;
      })
      .catch(error => {
            console.error('에러 발생:', error);
      });
}

// 상품 수정
function modifyProduct(){
    let category_Select = document.getElementById('category_Select');
    let selected_Option = category_Select.options[category_Select.selectedIndex];

    let category_Value = selected_Option.value;
    let exhibitName_Value = document.getElementById('input_ExhibitName').value;
    let author_Value = document.getElementById('input_Author').value;
    let place_Value = document.getElementById('input_ExhibitPlace').value;
    let price_Value = document.getElementById('input_Price').value;
    let description_Value = document.getElementById('input_Description').value;
    let duration_Value = document.getElementById('datePicker').value;
    let img_Value = document.getElementById('uploadInput').files[0];

    let formData = new FormData();
    formData.append('exhibitName', exhibitName_Value);
    formData.append('exhibitAddress', place_Value);
    formData.append('price', price_Value);
    formData.append('startDate', duration_Value.split(' to ')[0]);
    formData.append('endDate', duration_Value.split(' to ')[1]);
    formData.append('category', category_Value);
    formData.append('author', author_Value);
    formData.append('information', description_Value);
    formData.append('image', img_Value);

    // 쿼리 스트링으로 productId 가져오기
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let product_Id = urlParams.get('productId');
    
    // 상품 데이터 Update
    axios.put(`/api/admin/exhibits/${product_Id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }})
      .then(response => {
        console.log('Product updated successfully:', response.data);
        moveToProduct();
      })
      .catch(error => {
        console.error('Error updating product:', error);
      });
}

// 상품 페이지로 이동
function moveToProduct() {
    let product_Page = '/admin/exhibits';
    window.location.href = product_Page;
}

// 이미지 업로드
function uploadImage() {
    let file = document.getElementById('uploadInput').files[0];
    let reader = new FileReader();

    reader.readAsDataURL(file);
}