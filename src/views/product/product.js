let data; // 전역 범위에 선언된 data 변수
let key;
let value;

window.onload = function () {
    //카테고리별 작품(쿼리스트링) 가져오기
    let queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach(function (a, b) {
        key = a;
        value = b;
        return key, value
    });

    //검색시 작품 가져오기
    let searchKeyword = urlParams.get('word');
    console.log(searchKeyword)

    if (searchKeyword) {
        fetchFilterData(searchKeyword);
    } else {
        insertProductElement();
    }
}

//검색시 데이터 가져오기
async function fetchFilterData(keyword) {
    // 검색어를 서버에 전송하여 필터링된 데이터를 가져오는 함수
    const res = await fetch(`http://localhost:5001/api/exhibits?search=${keyword}`);
    const searchdata = await res.json();

    // numRows 변수 계산
    const numColumn = 4;
    const numRows = Math.ceil(searchdata.exhibits.length / numColumn);

    const list = document.querySelector('.exhibition-list');

    const addNewContent = () => {
        for (let i = 0; i < numRows; i++) {
            let columnsContainer = document.createElement('div');
            columnsContainer.classList.add('columns');
            columnsContainer.classList.add('is-multiline');

            for (let j = 0; j < numColumn; j++) {
                let dataIndex = i * numColumn + j;
                if (dataIndex < searchdata.exhibits.length) {
                    let data = searchdata.exhibits[dataIndex];
                    let columnContents = `
                        <div class="column is-one-quarter">
                            <a href="https://www.naver.com/">
                                <img src="${data.image}" alt="">
                                <div class="exhibitTitle"><a href="https://www.naver.com/"><div>${data.author}: ${data.exhibitName}</div></a></div>
                                <div class="exhibitInfo" id='listEnd'><a href="https://www.naver.com/" class="date">${data.startDate}~${data.endDate}</a></div>
                            </a>
                        </div>`;
                    columnsContainer.innerHTML += columnContents;
                }
            }
            list.appendChild(columnsContainer);
        }
    }; 
} 


    //필터,전체 데이터 가져오기
    async function insertProductElement() {
        const res = await fetch('http://localhost:5001/api/exhibits');
        const serverdata = await res.json();

        // numRows 변수 계산
        const numColumn = 4;
        const numRows = Math.ceil(serverdata.exhibits.length / numColumn);

        const list = document.querySelector('.exhibition-list');

        const addNewContent = () => {
            for (let i = 0; i < numRows; i++) {
                let columnsContainer = document.createElement('div');
                columnsContainer.classList.add('columns');
                columnsContainer.classList.add('is-multiline');

                for (let j = 0; j < numColumn; j++) {
                    let dataIndex = i * numColumn + j;
                    if (dataIndex < serverdata.exhibits.length) {
                        let data = serverdata.exhibits[dataIndex];
                        let columnContents = `
                        <div class="column is-one-quarter">
                            <a href="https://www.naver.com/">
                                <img src="${data.image}" alt="">
                                <div class="exhibitTitle"><a href="https://www.naver.com/"><div>${data.author}: ${data.exhibitName}</div></a></div>
                                <div class="exhibitInfo" id='listEnd'><a href="https://www.naver.com/" class="date">${data.startDate}~${data.endDate}</a></div>
                            </a>
                        </div>`;
                        columnsContainer.innerHTML += columnContents;
                        // 카테고리에 따라 페이지에 추가
                        // if (value === '조각전') {
                        //     columnsContainer.innerHTML += columnContents;
                        // } else if (data.category.category === '사진전') {
                        //     columnsContainer.innerHTML += columnContents;
                        // } else if (data.category.category === '그림전') {
                        //     columnsContainer.innerHTML += columnContents;
                        // } else (vlaue==아무것도 없다면){
                        //     columnsContainer.innerHTML += columnContents;
                        // }
                    }
                }
                list.appendChild(columnsContainer);
            }
        };

        // Intersection Observer 콜백함수
        const onIntersect = async (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    //관찰대상은 새로운 데이터를 가져올 때마다 변해야함
                    addNewContent();
                    // 기존 Observer 해제
                    observer.disconnect();
                    // 새로운 listEnd 요소 가져오기
                    listEnd = list.lastElementChild;
                    // 다시 Intersection Observer로 관찰 대상을 설정
                    observer.observe(listEnd);
                }
            });
        };

        // 설정 옵션
        const options = {
            root: null,
            rootMargin: '0px 0px 10px 0px',
            threshold: 0,
        };

        // 전시회 목록 초기 로드
        addNewContent();

        // 변수 listEnd 초기화
        let listEnd = list.lastElementChild; // 리스트의 끝을 나타내는 요소

        // Intersection Observer 생성 및 관찰 시작
        let observer = new IntersectionObserver(onIntersect, options);
        observer.observe(listEnd);
    }

    // 페이지 로드 시 전시회 목록을 추가
    window.addEventListener('load', insertProductElement);
