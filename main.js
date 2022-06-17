function validator(options){ 

    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            else{
                element = element.parentElement;
            }
        }
    }

    var selectorRules = {};

    function valiDate(inputElement, rule) {
        var messageElement = getParent(inputElement, options.formGroupSelector).querySelector(options.message); 
        var errorMessage;

        var rules = selectorRules[rule.selector];

        for(var i = 0; i<rules.length; ++i){
            errorMessage = rules[i](inputElement.value);
            if(errorMessage) break;
        }
        if(errorMessage){
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
            messageElement.innerText = errorMessage;
        }
        else {
            messageElement.innerText= "";
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !!errorMessage;
    }

    var formElement = document.querySelector(options.form); 
    if (formElement){
        formElement.onsubmit = function(e){
            e.preventDefault();

            var isFormValid = true;
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = valiDate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            });
            
            if(!isFormValid) {
                var datas = formElement.querySelectorAll('[name]:not([disabled])');
                var formDatas = Array.from(datas).reduce(function(values, input){
                    values[input.name] = input.value;
                    return values;
                }, {});
                options.onSubmit(formDatas);
            }
        }
        options.rules.forEach(function(rule){
            var inputElement = formElement.querySelector(rule.selector); 
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            } else{
                selectorRules[rule.selector] = [rule.test];
            }

            if(inputElement){
                inputElement.onblur = function(){
                    valiDate(inputElement, rule);
                }
                inputElement.oninput = function() {
                    var messageElement = getParent(inputElement, options.formGroupSelector).querySelector(options.message); 
                    messageElement.innerText= "";
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            }
        });
    };
};

validator.isRequired = function(selector){
    return {
        selector: selector,
        test: function(value){
            return value.trim() ? undefined : 'Vui lòng nhập trường này!';
        }
    }
};

validator.isEmail = function(selector){
    return {
        selector: selector,
        test: function(value){
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value)? undefined : 'Nhập email không chính xác!';
        }
    }
}

validator.isPassword = function(selector, min){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : `Nhập mật khẩu ít nhất ${min} ký tự`;
        }
    }
}

validator.isPassword_confirmation = function(selector, password){
    return {
        selector: selector,
        test: function(value){
            return value === password()? undefined : 'Nhập lại không chính xác!';
        }
    }
}
