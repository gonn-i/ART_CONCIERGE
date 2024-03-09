const response = await axios.get('/api/orders');
const orderData = response.data;
const $searchAddress = document.querySelector('#modalAddress')
const $detailAddress = document.querySelector('#detailAddress')
const $cancelModal = document.querySelector('#cancelModal')

$searchAddress.addEventListener('click', findPostcode)
function openEditOrderModal() {
  document.getElementById('editOrderModal').classList.add('is-active');
}

function closeEditOrderModal() {
  document.getElementById('editOrderModal').classList.remove('is-active');
}

function findPostcode() {
  new daum.Postcode({
    oncomplete: function (data) {
      // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

      // 각 주소의 노출 규칙에 따라 주소를 조합한다.
      // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
      var addr = ''; // 주소 변수
      var extraAddr = ''; // 참고항목 변수

      //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
      if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
        addr = data.roadAddress;
      } else { // 사용자가 지번 주소를 선택했을 경우(J)
        addr = data.jibunAddress;
      }

      // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
      if (data.userSelectedType === 'R') {
        // 법정동명이 있을 경우 추가한다. (법정리는 제외)
        // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        // 건물명이 있고, 공동주택일 경우 추가한다.
        if (data.buildingName !== '' && data.apartment === 'Y') {
          extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
        }
        // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
        if (extraAddr !== '') {
          extraAddr = ' (' + extraAddr + ')';
        }

      }
      document.querySelector('#changetemp').innerHTML = '<input type="text" id="userAddress" class="input is-medium" name="address" readonly>'
      document.getElementById("userAddress").value = addr;
      // 커서를 상세주소 필드로 이동한다.
      document.getElementById("sample6_detailAddress").focus();
    }
  }).open();
}




// 데이터를 HTML에 표시하는 함수
function displayOrderInfo(order) {
  console.log(order)
  const tableBody = document.querySelector('#tableBody')
  const newRow = document.createElement('tr');
  newRow.style.height = '130px';
  newRow.innerHTML = `
    <td>
      <a>
        <img class="image" src="${order.item[0].image}" alt="상품 이미지" width="50px" height="50px">
      </a>
    </td>
    <td>${order.item[0].exhibitName}</td>
    <td>${order.orderedDate}</td>
    <td>
      주문 금액<br>
      수량 : ${order.item[0].quantity}개
    </td>
    <td>
    <div class="container has-text-centered">
  
    <button id="changeOrder" data-order-id="${order._id}" class="button" style="display: ${order.deliveryStatus === '1' ? 'inline-block' : 'none'}">주문 수정</button>
    </div>
    </td>
    <td>
    <div class="container has-text-centered">
    <span id="deliveryStatusText">
        ${order.deliveryStatus === '1' ? '배송 준비중' : ''}
        ${order.deliveryStatus === '2' ? '배송 시작' : ''}
        ${order.deliveryStatus === '3' ? '배송 완료' : ''}
    </span>
    <br>
    <button id="cancelButton" data-order-id="${order._id}" class="button" style="display: ${order.deliveryStatus === '1' ? 'inline-block' : 'none'}">주문 취소</button>
    </div>
    </td>
  `;

  const $cancelButton = newRow.querySelector('#cancelButton')
  const $changeOrder = newRow.querySelector('#changeOrder')
  $cancelButton.addEventListener('click', async () => {
    const orderId = $cancelButton.getAttribute('data-order-id')
    console.log(orderId)
    try {
      await axios.delete(`/api/orders/${orderId}`)
      Swal.fire({
        title: '주문이 취소 되었습니다',
        icon: 'success',
        confirmButtonColor: '#363636',
        confirmButtonText: '확인'
      }).then(() => {
        location.reload();
      })
    }
    catch {
    }
  })

  $changeOrder.addEventListener('click', () => {
    openEditOrderModal();
    const $editOrder = document.querySelector('#editOrder')
    $editOrder.addEventListener('click', async () => {
      const orderId = $changeOrder.getAttribute('data-order-id')

      const editName = document.querySelector('#modalName').value
      const editPhone = document.querySelector('#modalPhone').value
      const editAddress = document.querySelector('#userAddress').value
      const editDetailAddress = document.querySelector('#sample6_detailAddress').value
      const editQuantity = document.querySelector('#modalQuantity').value
      console.log(editName,"이름")
      try {
        await axios.put(`/api/orders/${orderId}`, {
          orderId: orderId,
          userAddress: editAddress,
          detailAddress: editDetailAddress,
          phone: editPhone,
          name: editName,
          quantity: editQuantity
        })
        Swal.fire({
          title: '주문이 수정 되었습니다',
          icon: 'success',
          confirmButtonColor: '#363636',
          confirmButtonText: '확인'
        }).then(() => {
          location.reload();
        })
      }
      catch {
      }
    })
  });
  tableBody.appendChild(newRow);



}
$cancelModal.addEventListener('click', () => {
  closeEditOrderModal()
})
// 각 주문 정보를 반복하며 HTML에 추가
orderData.forEach(displayOrderInfo);
