import { getDB } from '../indexedDB.js';

const $selectAll = document.querySelector('.selectAll')
const $selectionDelete = document.querySelector('.deleteSelection')
const $buy = document.querySelector('.buy')
const $totalItemPrice = document.querySelector('.totalItemPrice')
const $totalPrice = document.querySelector('.totalPrice')
const $deleteAll = document.querySelector('.deleteAll')
const db = await getDB();
let flag = false;
token = getCookie('token');

updateProductListFromIndexedDB()


async function checkIndexedDB() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('shoppingCart', 'readonly');
    const objectStore = transaction.objectStore('shoppingCart');
    const request = objectStore.openCursor();

    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (!cursor) {
        console.log('IndexedDB is empty');
        flag = true;
      } else {
        console.log('IndexedDB is not empty');
        flag = false;
      }
      resolve();  // Resolve the promise when the operation is complete
    };

    request.onerror = function (event) {
      console.error('Error checking IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
}

function reloadAmount() {
  let totalPrice = 0
  const $price = document.querySelectorAll('.price')
  $price.forEach((e) => {
    totalPrice += Number(e.textContent)
  })
  $totalItemPrice.textContent = totalPrice
  $totalPrice.textContent = totalPrice
}

$buy.addEventListener('click', async (event) => {
  event.preventDefault()
  await checkIndexedDB()
  if (!token) {
    Swal.fire({
      title: '로그인이 필요합니다',
      icon: 'warning',
      confirmButtonColor: '#363636',
      confirmButtonText: '확인',
    })
    return
  }

  if (flag) {
    Swal.fire({
      title: '장바구니가 비어있습니다',
      icon: 'warning',
      confirmButtonColor: '#363636',
      confirmButtonText: '확인',
    })
    return
  }

  window.location.href = '/orderComplete'
})

$deleteAll.addEventListener('click', async () => {
  Swal.fire({
    title: '장바구니를 비우시겠습니까?',
    text: "삭제하시면 다시 복구시킬 수 없습니다.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#363636',
    cancelButtonColor: '#C0C0C0',
    confirmButtonText: '확인',
    cancelButtonText: '취소'
  }).then(async (result) => {
    if (result.value) {
      try {
        const transaction = db.transaction('shoppingCart', 'readwrite');
        const objectStore = transaction.objectStore('shoppingCart');
        const clearRequest = objectStore.clear();

        clearRequest.onsuccess = function () {
          console.log('Shopping cart cleared successfully');
          updateProductListFromIndexedDB(); // Update the UI after clearing the items
          reloadAmount(); // Reload the total amount
        };

        clearRequest.onerror = function (event) {
          console.error('Error clearing shopping cart:', event.target.error);
        };
      } catch (error) {
        console.error('Error clearing shopping cart:', error);
      }
    }
  });
});



function deleteItemFromDB(key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('shoppingCart', 'readwrite');
    const objectStore = transaction.objectStore('shoppingCart');
    const deleteRequest = objectStore.delete(key);

    deleteRequest.onsuccess = function (event) {
      console.log(`Item with key ${key} deleted successfully`);
      resolve();
    };

    deleteRequest.onerror = function (event) {
      console.error(`Error deleting item with key ${key}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

function updateNumberOfItems(key, quantity) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('shoppingCart', 'readwrite');
    const objectStore = transaction.objectStore('shoppingCart');
    const getRequest = objectStore.get(key);

    getRequest.onsuccess = function (event) {
      const selectedItem = event.target.result;
      selectedItem.count = quantity;

      const updateRequest = objectStore.put(selectedItem);

      updateRequest.onsuccess = function (event) {
        resolve();
      };

      updateRequest.onerror = function (event) {
        reject(event.target.error);
      };
    };

    getRequest.onerror = function (event) {
      reject(event.target.error);
    };
  });
}


function makeEventListener($itemPlusButton, $itemMinusButton, $itemDeleteButton) {
  $itemDeleteButton.addEventListener('click', (event) => {
    Swal.fire({
      title: '선택 된 상품을 제거하시겠습니까?',
      text: "삭제하시면 다시 복구시킬 수 없습니다.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#363636',
      cancelButtonColor: '#C0C0C0',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then(async (result) => {
      if (result.value) {
        const listItem = event.target.closest('li');
        const key = Number(listItem.dataset.key)
        if (listItem) {
          listItem.remove();
          console.log("delete");
          checkIndexedDB()
          reloadAmount();
          await deleteItemFromDB(key)
        }
      }
    });
  });

  $itemPlusButton.addEventListener('click', async (e) => {
    const quantityInput = e.target.parentNode.parentNode.parentNode.querySelector('.inp');
    const $itemPrice = e.target.parentNode.parentNode.parentNode.querySelector('.price')
    const itemPrice = parseInt($itemPrice.textContent)
    let quantity = parseInt(quantityInput.value);

    const oneItemPrice = itemPrice / quantity
    quantity++;
    quantityInput.value = quantity;

    $itemPrice.textContent = oneItemPrice * quantity
    reloadAmount();

    const key = parseInt(e.target.closest('li').dataset.key);
    await updateNumberOfItems(key, quantity);

  });



  $itemMinusButton.addEventListener('click', async (e) => {
    const quantityInput = e.target.parentNode.parentNode.parentNode.querySelector('.inp');
    const $itemPrice = e.target.parentNode.parentNode.parentNode.querySelector('.price')
    const itemPrice = parseInt($itemPrice.textContent)
    let quantity = parseInt(quantityInput.value);

    const oneItemPrice = itemPrice / quantity
    if (quantity > 1) {
      quantity--;
    }

    quantityInput.value = quantity;

    $itemPrice.textContent = oneItemPrice * quantity
    reloadAmount();

    const key = parseInt(e.target.closest('li').dataset.key);
    await updateNumberOfItems(key, quantity);

  });

}

$selectAll.addEventListener('click', () => {
  const $priceCheckbox = document.querySelectorAll('.priceCheckbox')
  if ($selectAll.checked) {
    $priceCheckbox.forEach((e) => {
      e.checked = true
    })
  }
  else {
    $priceCheckbox.forEach((e) => {
      e.checked = false
    })
  }

})

$selectionDelete.addEventListener('click', () => {
  Swal.fire({
    title: '선택 된 상품을 제거하시겠습니까?',
    text: "삭제하시면 다시 복구시킬 수 없습니다.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#363636',
    cancelButtonColor: '#C0C0C0',
    confirmButtonText: '삭제',
    cancelButtonText: '취소'
  }).then(async (result) => {
    if (result.value) {
      const checkedCheckboxes = document.querySelectorAll('.priceCheckbox:checked');

      for (const checkbox of checkedCheckboxes) {
        const productListItem = checkbox.closest('li');
        if (productListItem) {
          productListItem.remove();
          const key = Number(productListItem.dataset.key);
          console.log("delete");
          reloadAmount();
          await deleteItemFromDB(key);
        }
      }
    }
  });
});

async function updateProductListFromIndexedDB() {
  const $productList = document.querySelector('.productList');
  // 목록에 있는 기존 항목을 지웁니다.
  $productList.innerHTML = '';

  try {
    const transaction = db.transaction('shoppingCart', 'readonly');
    const objectStore = transaction.objectStore('shoppingCart');
    const request = objectStore.openCursor();

    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const $listItem = document.createElement('li');

        // 각 아이템에 대한 HTML 요소를 만들어 목록에 추가합니다.
        $listItem.innerHTML = `<div class="columns py-6 is-vcentered" style="border-top:solid #C0C0C0 1.5px ">
          <div class="column is-1 ">
            <label>
              <div class="itemContainer" style="display: inline;">
                <input class="priceCheckbox" type="checkbox" />
                <div class="cbx">
                  <div class="flip">
                    <div class="front"></div>
                    <div class="back">
                      <svg width="16" height="14" viewBox="0 0 16 14">
                        <path d="M2 8.5L6 12.5L14 1.5"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </label>
          </div>
          
          <div class="column is-3"><img src=${cursor.value.exhibitImg} alt="상품이미지"></div>
        
          <div class="column is-4 is-flex is-flex-direction-column">
            <span class="itemName">${cursor.value.exhibitName}</span>
            <div>
            <span class="price">${cursor.value.price * cursor.value.quantity}</span> ￦
            </div>
            
          </div>
          <div class="column is-3">
            <div class="count-wrap">
              <button type="button" class="minus">-</button>
              <input type="text" class="inp" value=${cursor.value.quantity} />
              <button type="button" class="plus">+</button>
            </div>
          </div>
          <div class="column is-1 has-text-centered">
            <span class="itemDelete">X</span>
          </div>
        </div>`;
        const key = cursor.primaryKey;
        $listItem.dataset.key = key;

        const $itemPlusButton = $listItem.querySelector('.plus')
        const $itemMinusButton = $listItem.querySelector('.minus')
        const $itemDeleteButton = $listItem.querySelector('.itemDelete')
        makeEventListener($itemPlusButton, $itemMinusButton, $itemDeleteButton);
        $productList.appendChild($listItem);

        // 커서를 다음 아이템으로 이동합니다.

        cursor.continue();
      } else {
        // 모든 아이템을 처리한 후에 reloadAmount() 호출
        reloadAmount();
      }
    }
  }

  // 에러가 발생한 경우 처리합니다.
  catch {
    request.onerror = function (event) {
      console.error("indexedDB에서 데이터를 읽는 중 오류 발생:", event.target.error);
    };
  }
}




