

    function restrictMinus(e) {



        var inputKeyCode = e.keyCode ? e.keyCode : e.whic

        if (inputKeyCode != null) {
            if (inputKeyCode == 45) e.preventDefault();
        }
    
}

    function update(){
        
            var cartRows=document.getElementsByClassName('table')
            console.log(cartRows)
            console.log("length"+cartRows.length)
            var total=0;
            for(var i=0; i<cartRows.length;i++){
                var cartRow=cartRows[i]
                console.log("helloooo")
                console.log(cartRows[i])
                var priceElement=cartRow.getElementsByClassName('Price')[0]
                console.log("Price");
                console.log(priceElement)
                var qtyElement=cartRow.getElementsByClassName('Quantity')[0]
                console.log("QTY");
                console.log(qtyElement)
                var price=parseFloat(priceElement.innerText.replace('Rs',''))
                console.log("Price"+price);
                var quantity=qtyElement.value
                
                console.log("qty"+quantity);
                total=total+(price*quantity)
                console.log("TOTOAL"+total);
            }
            total=Math.round(total*100)/100
        document.getElementsByClassName('total')[0].innerHTML='Total Rs: '+ total
    }