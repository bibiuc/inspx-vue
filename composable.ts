import {
    unrefElement,
    useResizeObserver,
    useEventListener,
    useMouse,
    tryOnMounted,
    Fn
} from '@vueuse/core';
import { watch, unref, ref, computed } from 'vue';
import type {Ref} from 'vue';
export type SizeBox = {
    type: 'size' | 'margin' | 'padding' | 'border';
    x: number;
    y: number;
    w: number;
    h: number;
    size: string | number;
};
type DBox = [
    top:number,
    right:number,
    bottom:number,
    left:number,
    name: 'margin' | 'padding' | 'border'
]
const defaultValues = {
    //without margen, padding, border
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    marginTop: 0,
    marginRight: 0,
    marginLeft: 0,
    marginBottom: 0,
    borderTop: 0,
    borderRight: 0,
    borderLeft: 0,
    borderBottom: 0,
};
const calStyles = [
    ['paddingTop', 'paddingTop'],
    ['paddingRight', 'paddingRight'],
    ['paddingBottom', 'paddingBottom'],
    ['paddingLeft', 'paddingLeft'],
    ['marginTop', 'marginTop'],
    ['marginRight', 'marginRight'],
    ['marginLeft', 'marginLeft'],
    ['marginBottom', 'marginBottom'],
    ['borderTop', 'borderTopWidth'],
    ['borderRight', 'borderRightWidth'],
    ['borderLeft', 'borderLeftWidth'],
    ['borderBottom', 'borderBottomWidth'],
    ['width', 'width'],
    ['height', 'height'],
];
export const useElementRects = (element: Ref<HTMLElement|null>) => {
    const size = ref({ ...defaultValues });
    const boxes = computed<SizeBox[]>(() => {
        const { left, top, width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, borderTop, borderRight, borderBottom, borderLeft, marginTop, marginRight, marginBottom, marginLeft } = unref(size);
        const _boxes: SizeBox[] = [];
        if (!width || !height) {
            return [];
        }
        let fullTop: number = marginTop + borderTop + paddingTop,
            fullLeft: number = marginLeft + borderLeft + paddingLeft,
            fullHeight: number = height,
            fullWidth: number = width;
        _boxes.push({ type: 'size', x: fullLeft, y: fullTop, w: width, h: height, size: `${width}*${height}` });
        (
            [
                [paddingTop, paddingRight, paddingBottom, paddingLeft, 'padding'],
                [borderTop, borderRight, borderBottom, borderLeft, 'border'],
                [marginTop, marginRight, marginBottom, marginLeft, 'margin'],
            ] as DBox[]
        ).forEach(([t, r, b, l, type]) => {
            fullTop -= t;
            fullLeft -= l;
            fullHeight += t + b;
            fullWidth += l + r;
            if (t) {
                _boxes.push({ type, x: fullLeft + l, y: fullTop, w: fullWidth - l - r, h: t, size: t });
            }
            if (l) {
                _boxes.push({ type, x: fullLeft, y: fullTop, w: l, h: fullHeight, size: l });
            }
            if (b) {
                _boxes.push({ type, x: fullLeft + l, y: fullTop + fullHeight - b, w: fullWidth - l - r, h: b, size: b });
            }
            if (r) {
                _boxes.push({ type, x: fullLeft + fullWidth - r, y: fullTop, w: r, h: fullHeight, size: r });
            }
        });
        return _boxes;
    });
    const update = () => {
        const _rect = { ...defaultValues };
        const el = unref(element) as HTMLElement;
        if (el) {
            const style = getComputedStyle(el);
            for (let i = 0; i < calStyles.length; i++) {
                const [key, styleKey] = calStyles[i];
                const value = parseInt(style[styleKey], 10);
                _rect[key] = isNaN(value) ? 0 : value;
            }
            _rect.top = el.offsetTop - _rect.marginTop;
            _rect.left = el.offsetLeft - _rect.marginLeft;
            if (style.boxSizing == 'border-box') {
                _rect.height -= _rect.borderTop + _rect.borderBottom + _rect.paddingTop + _rect.paddingBottom;
                _rect.width -= _rect.borderLeft + _rect.borderRight + _rect.paddingLeft + _rect.paddingRight;
            }
        }
        size.value = _rect;
    };

    useResizeObserver(element, update);
    watch(
        () => unrefElement(element),
        ele => update(),
    );

    useEventListener('scroll', update, { capture: true, passive: true });
    useEventListener('resize', update, { passive: true });

    tryOnMounted(() => {
        update();
    });
    return { size, boxes };
};
export const useMouseElement = handler => {
    const { x, y } = useMouse();
    const element = ref<HTMLElement | Element | null>(null);
    const mouseHandlerWrapper = e => {
        element.value = e.target;
    };
    const touchHandlerWrapper = e => {
        element.value = e.target;
    };
    const reset = e => {
        element.value = null;
    };
    const handlers: Fn[] = [];
    watch(handler, v => {
        let h;
        while ((h = handlers.shift())) {
            h();
        }
        if (v) {
            handlers.push(useEventListener(window, 'mousemove', mouseHandlerWrapper, { passive: true }));
            handlers.push(useEventListener(window, 'mouseover', mouseHandlerWrapper, { passive: true }));
            handlers.push(useEventListener(window, 'dragover', mouseHandlerWrapper, { passive: true }));
            handlers.push(useEventListener(window, 'touchstart', touchHandlerWrapper, { passive: true }));
            handlers.push(useEventListener(window, 'touchmove', touchHandlerWrapper, { passive: true }));
            handlers.push(useEventListener(window, 'touchend', reset, { passive: true }));
            const nodes = document.elementsFromPoint(unref(x), unref(y));
            element.value = nodes[0];
        }
    });
    return element;
};