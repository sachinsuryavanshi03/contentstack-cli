declare const Base: any;
declare class TablePrompt extends Base {
    /**
     * Initialise the prompt
     *
     * @param  {Object} questions
     * @param  {Object} rl
     * @param  {Object} answers
     */
    constructor(questions: any, rl: any, answers: any);
    /**
     * Start the inquirer session
     *
     * @param  {Function} callback
     * @return {TablePrompt}
     */
    _run(callback: any): this;
    getCurrentValue(): any[];
    onDownKey(): void;
    onEnd(state: any): void;
    onError(state: any): void;
    onLeftKey(): void;
    onRightKey(): void;
    selectAllValues(value: any): void;
    onSpaceKey(): void;
    onUpKey(): void;
    paginate(): number[];
    render(error?: string): void;
}
export = TablePrompt;
